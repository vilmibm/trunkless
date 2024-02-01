/*
Given plaintext content on STDIN, emit "phrases" to STDOUT.

Phrases are a loose, artistic concept. The end goal of a phrase is to be useful fodder as a line in a cut-up poem.

*/

package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

func main() {
	phraseMarkers := map[rune]bool{
		';':  true,
		',':  true,
		':':  true,
		'.':  true,
		'?':  true,
		'!':  true,
		'(':  true,
		')':  true,
		'\'': true,
		'{':  true,
		'}':  true,
		'[':  true,
		']':  true,
		'“':  true,
		'”':  true,
		'=':  true,
		'`':  true,
	}

	s := bufio.NewScanner(os.Stdin)
	phraseBuff := []byte{}
	for s.Scan() {
		text := strings.TrimSpace(s.Text())
		seenSpace := false
		for i, r := range text {
			if r == ' ' {
				seenSpace = true
			}
			if ok, val := phraseMarkers[r]; ok && val {
				if len(phraseBuff) >= 20 && seenSpace {
					// TODO QA check for alphabetic content
					fmt.Println(strings.TrimSpace(string(phraseBuff)))
				}
				phraseBuff = []byte{}
			} else {
				asStr := string(phraseBuff)
				if r == ' ' && strings.HasSuffix(asStr, " ") {
					continue
				}
				phraseBuff = append(phraseBuff, byte(r))
				if i == len(text)-1 && len(phraseBuff) > 0 && !strings.HasSuffix(asStr, " ") {
					phraseBuff = append(phraseBuff, byte(' '))
				}
			}
		}
	}
}

func clean(s string) string {
	s = strings.ReplaceAll(s, "’", "'")

	return s
}
