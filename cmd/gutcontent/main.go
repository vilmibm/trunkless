/*
Given a project gutenberg plaintext book on STDIN, this program prints just its content (ie with header and footer stripped)
*/

package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

func main() {
	s := bufio.NewScanner(os.Stdin)
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
