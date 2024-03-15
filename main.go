package main

import (
	"html/template"
	"log"
	"math/big"
	"net/http"
	"strings"

	"crypto/rand"
	"database/sql"

	"github.com/gin-gonic/gin"

	_ "github.com/mattn/go-sqlite3"
)

// TODO multiple backends
// I've been waffling on the question of whether to support multiple backends.
// there are two narratives here.
// NARRATIVE ONE: TRUNKLESS IS AN ART MACHINE BASED ON GUTENBERG
// Trunkless is specifically about exploring the project gutenberg corpus. It's a massive corpus that depicts a particular era of the English language. This focus means anyone working with it is exploring the same phrase space.
//
// Poets wishing for a similar interface that can be used generally should consult $TOOLTHATDOESNOTEXIST for doing digital cutup poetry locally.

// NARRATIVE TWO: TRUNKLESS IS A GENERAL PURPOSE CUTUP POETRY WORKBENCH
// Embodied in trunkless is a fundamental user interface for making digital cut-up poetry. This interface can support any kind of phrase backend. Because preparing the phrase backends is time and labor consuming, the user-poets cannot add their own; however, they can submit them for addition.

// If I wanted to support multiple backends what would it take?
// - a backend selector on the web tool -- drop down
// - extension of schema to include more clear metadata -- specifically a an optional sourceURL
// - changes to this file to support pairs of (dsn, maxID)s
//
// it's not that hard but given that i'm a stopgap for adding new phrase backends it feels like wasted effort.

// what about this narrative? I launch just with gutenberg and see if I hear "wow i want this for other stuff"
// the thing is, I want it for my stuff. but I consistently don't want a web app. I want a CLI or a controller-based interface. I can sit myself and put time into working on poems from gutenberg and then see if I want to build something totally new or just add new phrase backends.

// no matter what there are improvements to phrasing I want to see before I let anyone see this (even to beta test) so the plan now is:

// ship phraser improvements
// get a deployment pipeline
// seek beta feedback

const (
	dsn   = "phrase.db?cache=shared&mode=r"
	maxID = 467014991
)

func connectDB() (*sql.DB, error) {
	db, err := sql.Open("sqlite3", dsn)
	if err != nil {
		return nil, err
	}

	return db, nil
}

type source struct {
	ID   int64
	Name string
}

type phrase struct {
	ID     int64
	Text   string
	Source source
}

func main() {
	r := gin.Default()
	r.SetFuncMap(template.FuncMap{
		"upper": strings.ToUpper,
	})
	r.LoadHTMLFiles("templates/index.tmpl")
	r.StaticFile("/cutive.ttf", "./assets/cutive.ttf")
	r.StaticFile("/favicon.ico", "./assets/favicon.ico")
	r.StaticFile("/bg_light.gif", "./assets/bg_light.gif")
	r.StaticFile("/bg_dark.gif", "./assets/bg_dark.gif")
	r.StaticFile("/main.js", "./assets/main.js")
	r.StaticFile("/html2canvas.min.js", "./assets/html2canvas.min.js")

	randMax := big.NewInt(maxID)

	r.HEAD("/", func(c *gin.Context) {
		c.String(http.StatusOK, "")
	})

	r.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.tmpl", struct {
			MaxID int
			// TODO anything else?
		}{maxID})
	})

	r.GET("/line", func(c *gin.Context) {
		db, err := connectDB()
		if err != nil {
			log.Println(err.Error())
			c.String(http.StatusInternalServerError, "oh no.")
			return
		}
		defer db.Close()

		id, err := rand.Int(rand.Reader, randMax)
		if err != nil {
			log.Println(err.Error())
			c.String(http.StatusInternalServerError, "oh no.")
			return
		}

		stmt, err := db.Prepare("select p.phrase, p.id, s.name from phrases p join sources s on p.sourceid = s.id where p.id = ?")
		if err != nil {
			log.Println(err.Error())
			c.String(http.StatusInternalServerError, "oh no.")
			return
		}

		row := stmt.QueryRow(id.Int64())
		var p phrase
		var s source
		err = row.Scan(&p.Text, &s.ID, &s.Name)
		if err != nil {
			log.Println(err.Error())
			c.String(http.StatusInternalServerError, "oh no.")
		}
		p.Source = s
		p.ID = id.Int64()
		c.JSON(http.StatusOK, p)
	})

	r.Run() // 8080
}
