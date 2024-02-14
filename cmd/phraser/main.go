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
		';': true,
		',': true,
		':': true,
		'.': true,
		'?': true,
		'!': true,
		//'(':  true,
		')': true,
		//'{':  true,
		'}': true,
		//'[':  true,
		']': true,
		//'\'': true,
		//'"':  true,
		//'“':  true,
		'”': true,
		'=': true,
		'`': true,
		'-': true,
	}

	s := bufio.NewScanner(os.Stdin)
	phraseBuff := []byte{}
	printed := false
	for s.Scan() {
		text := strings.TrimSpace(s.Text())
		for i, r := range text {
			if ok, val := phraseMarkers[r]; ok && val {
				if len(phraseBuff) >= 10 {
					cleaned := clean(phraseBuff)
					if len(cleaned) > 0 {
						fmt.Println(cleaned)
						printed = true
					}
				}
				if !printed {
					//fmt.Fprintf(os.Stderr, "SKIP: %s\n", string(phraseBuff))
				}
				printed = false
				phraseBuff = []byte{}
			} else {
				asStr := string(phraseBuff)
				if r == ' ' && strings.HasSuffix(asStr, " ") {
					continue
				}
				if i == 0 && len(phraseBuff) > 0 && phraseBuff[len(phraseBuff)-1] != ' ' && r != ' ' {
					phraseBuff = append(phraseBuff, byte(' '))
				}
				phraseBuff = append(phraseBuff, byte(r))
			}
		}
	}
}

func isAlpha(r rune) bool {
	alphaChars := map[rune]bool{
		'a': true,
		'b': true,
		'c': true,
		'd': true,
		'e': true,
		'f': true,
		'g': true,
		'h': true,
		'i': true,
		'j': true,
		'k': true,
		'l': true,
		'm': true,
		'n': true,
		'o': true,
		'p': true,
		'q': true,
		'r': true,
		's': true,
		't': true,
		'u': true,
		'v': true,
		'w': true,
		'x': true,
		'y': true,
		'z': true,
	}
	lookup := strings.ToLower(string(r))
	return alphaChars[rune(lookup[0])]
}

func alphaPercent(s string) float64 {
	total := 0.0
	alpha := 0.0

	for _, r := range s {
		total++
		if isAlpha(r) {
			alpha++
		}
	}

	return 100 * (alpha / total)
}

func clean(bs []byte) string {
	s := string(bs)
	s = strings.ReplaceAll(s, "’", "'")
	s = strings.ReplaceAll(s, "\"", "")
	s = strings.TrimSpace(s)
	s = strings.ToLower(s)

	// TODO strip _
	// TODO strip *

	if alphaPercent(s) < 50.0 {
		return ""
	}

	return s
}
