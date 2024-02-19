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
	ID    int64
	Name  string
	GutID string
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
	r.StaticFile("/favicon.ico", "./assets/favicon.ico")
	r.StaticFile("/main.js", "./assets/main.js")

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
		sourceSplit := strings.SplitN(s.Name, " ", 2)
		if len(sourceSplit) > 1 {
			s.Name = strings.TrimSpace(sourceSplit[1])
			s.GutID = strings.TrimSpace(sourceSplit[0])
		}
		p.Source = s
		p.ID = id.Int64()
		c.JSON(http.StatusOK, p)
	})

	r.Run() // 8080
}
