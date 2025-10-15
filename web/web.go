package web

import (
	"context"
	"crypto/rand"
	"fmt"
	"html/template"
	"log"
	"math/big"
	mrand "math/rand"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/vilmibm/trunkless/db"
)

type source struct {
	ID   string
	Name string
}

type phrase struct {
	ID     int64
	Text   string
	Source source
}

type corpus struct {
	ID    string
	Name  string
	MaxID *big.Int
}

type ServeOpts struct {
	Port int
}

func Serve(opts ServeOpts) error {
	r := gin.Default()
	r.SetFuncMap(template.FuncMap{
		"upper": strings.ToUpper,
	})
	r.LoadHTMLFiles("templates/index.tmpl")
	r.StaticFile("/cutive.ttf", "./web/assets/cutive.ttf")
	r.StaticFile("/favicon.ico", "./web/assets/favicon.ico")
	r.StaticFile("/bg_light.gif", "./web/assets/bg_light.gif")
	r.StaticFile("/bg_dark.gif", "./web/assets/bg_dark.gif")
	r.StaticFile("/main.js", "./web/assets/main.js")
	r.StaticFile("/html2canvas.min.js", "./web/assets/html2canvas.min.js")

	bctx := context.Background()

	pool, err := db.Pool()
	if err != nil {
		return fmt.Errorf("db pool failed: %w", err)
	}
	defer pool.Close()

	corpora := []corpus{}

	conn, err := db.Connect()
	if err != nil {
		return err
	}

	fmt.Println("gathering max IDs...")
	rows, err := conn.Query(bctx, "SELECT tablename FROM pg_tables WHERE tablename LIKE '%phrases_%'")
	if err != nil {
		return fmt.Errorf("tablename query failed: %w", err)
	}
	defer rows.Close()
	tables := []string{}
	for rows.Next() {
		var tablename string
		err = rows.Scan(&tablename)
		if err != nil {
			return err
		}
		tables = append(tables, tablename)
	}
	rows.Close()

	/*
		the changes I am considering making pre-release:

		- multi-corpus select. the upper drop down selects a default corpus, but
		different corpora can be picked per-line.
		- selecting a randomizing strategy.
		  1. phrase weighted. pick random phrase from all in corpora with equal weight; bigger sources thus appear more.
			2. source weighted. pick a random source from a corpora then pick a random phrase. all sources thus have an equal chance of being selected from.
		- posting to a global feed.

			counter arguments.

			- this is a question of corpus curation. a corpus should have the
			combination of sources desired to cut from.
			- source weighting is not trivial -- need to pre-cache the IDs for
			sources or fetch them all into memory and hope they are indexed properly
			so it doesn't take too long.
			- posting means i have to rethink editing -- it would need to become just a scissors tool.
			- posting _should_ be hooked into activitypub -- i don't want to figure
			that out before release

			I am going to punt and focus on getting this released.
	*/

	fmt.Printf("found %d tables\n", len(tables))

	for _, tablename := range tables {
		fmt.Printf("- %s...", tablename)
		var maxID int64
		err = conn.QueryRow(bctx, fmt.Sprintf("SELECT max(id) FROM %s", tablename)).Scan(&maxID)
		if err != nil {
			return err
		}
		fmt.Printf("%v...", maxID)

		parts := strings.Split(tablename, "_")
		corpusid := parts[1]
		var name string
		err := conn.QueryRow(bctx, "SELECT name FROM corpora WHERE id=$1", corpusid).Scan(&name)
		if err != nil {
			return err
		}
		fmt.Printf("%s.\n", name)
		corpora = append(corpora, corpus{
			ID:    corpusid,
			Name:  name,
			MaxID: big.NewInt(maxID),
		})
	}
	conn.Close(bctx)
	fmt.Println("...done")

	r.HEAD("/", func(c *gin.Context) {
		c.String(http.StatusOK, "")
	})

	r.GET("/", func(c *gin.Context) {
		corpusid := c.DefaultQuery("corpus", "c3d8e9")
		c.HTML(http.StatusOK, "index.tmpl", struct {
			SelectedCorpus string
			Corpora        []corpus
		}{corpusid, corpora})
	})

	r.GET("/line", func(c *gin.Context) {
		conn, err := pool.Acquire(bctx)
		if err != nil {
			log.Println(err.Error())
			c.String(http.StatusInternalServerError, "oh no.")
			return
		}
		defer conn.Release()

		corpusid := c.DefaultQuery("corpus", "")
		if corpusid == "" {
			ix := mrand.Intn(len(corpora))
			corpusid = corpora[ix].ID
		}

		var cpus corpus

		var tablename string
		for _, corpus := range corpora {
			if corpus.ID == corpusid {
				cpus = corpus
				tablename = fmt.Sprintf("phrases_%s", corpusid)
			}
		}
		if tablename == "" {
			c.String(http.StatusTeapot, "have some tea :)")
		}

		id, err := rand.Int(rand.Reader, cpus.MaxID)
		if err != nil {
			log.Println(err.Error())
			c.String(http.StatusInternalServerError, "oh no.")
			return
		}

		var p phrase
		var s source
		err = conn.QueryRow(bctx,
			fmt.Sprintf(
				"SELECT p.phrase, s.id, s.name FROM phrases_%s p join sources s on p.sourceid = s.id where p.id = $1", cpus.ID),
			id.Int64()).Scan(&p.Text, &s.ID, &s.Name)
		if err != nil {
			log.Println(err.Error())
			c.String(http.StatusInternalServerError, "oh no.")
		}
		p.Source = s
		p.ID = id.Int64()
		conn.Release()
		c.JSON(http.StatusOK, p)
	})

	return r.Run(fmt.Sprintf(":%d", opts.Port))
}
