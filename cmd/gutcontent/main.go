/*
Given a project gutenberg plaintext book filename, this program prints just its content (ie with header and footer stripped)
*/

package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Fprintln(os.Stderr, "need a filename argument")
		os.Exit(1)
	}
	filename := os.Args[1]
	f, err := os.Open(filename)
	if err != nil {
		fmt.Fprintf(os.Stderr, "could not open '%s' for reading\n", filename)
		os.Exit(2)
	}

	s := bufio.NewScanner(f)
	inHeader := true
	inFooter := false
	skippedAll := true
	for s.Scan() {
		text := strings.TrimSpace(s.Text())
		if inFooter {
			break
		}
		if strings.HasPrefix(text, "*** START") {
			inHeader = false
			continue
		}
		if inHeader {
			continue
		}
		if strings.HasPrefix(text, "*** END") {
			inFooter = true
			continue
		}
		fmt.Println(text)
		if skippedAll {
			skippedAll = false
		}
	}
	if skippedAll {
		fmt.Fprintln(os.Stderr, "warning: found no text to print")
	}
}
