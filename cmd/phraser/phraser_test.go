package main

import "testing"

func Test_isAlpha(t *testing.T) {
	cs := []struct {
		arg      rune
		expected bool
	}{
		{arg: 'a', expected: true},
		{arg: 'b', expected: true},
		{arg: 'c', expected: true},
		{arg: 'd', expected: true},
		{arg: 'e', expected: true},
		{arg: 'f', expected: true},
		{arg: 'g', expected: true},
		{arg: 'h', expected: true},
		{arg: 'i', expected: true},
		{arg: 'j', expected: true},
		{arg: 'k', expected: true},
		{arg: 'l', expected: true},
		{arg: 'm', expected: true},
		{arg: 'n', expected: true},
		{arg: 'o', expected: true},
		{arg: 'p', expected: true},
		{arg: 'q', expected: true},
		{arg: 'r', expected: true},
		{arg: 's', expected: true},
		{arg: 't', expected: true},
		{arg: 'u', expected: true},
		{arg: 'v', expected: true},
		{arg: 'w', expected: true},
		{arg: 'x', expected: true},
		{arg: 'y', expected: true},
		{arg: 'z', expected: true},
		{arg: '1'},
		{arg: '2'},
		{arg: '3'},
		{arg: '\''},
		{arg: '"'},
		{arg: '#'},
		{arg: '%'},
	}

	for _, c := range cs {
		t.Run(string(c.arg), func(t *testing.T) {
			result := isAlpha(c.arg)
			if result != c.expected {
				t.Errorf("got '%v', expected '%v'", result, c.expected)
			}
		})
	}
}

func Test_alphaPercent(t *testing.T) {
	cs := []struct {
		arg      string
		expected float64
	}{
		{
			arg:      "abcd",
			expected: 100.0,
		},
		{
			arg:      "a1b2c3d4",
			expected: 50.0,
		},
		{
			arg:      "--------",
			expected: 0.0,
		},
	}

	for _, c := range cs {
		t.Run(c.arg, func(t *testing.T) {
			result := alphaPercent(c.arg)
			if result != c.expected {
				t.Errorf("got '%v', expected '%v'", result, c.expected)
			}
		})
	}
}

func Test_clean(t *testing.T) {
	cs := []struct {
		name     string
		arg      string
		expected string
	}{
		{
			name:     "all whitespace rejected",
			arg:      "     ",
			expected: "",
		},
		{
			name:     "trimmed",
			arg:      " cats eat fish    ",
			expected: "cats eat fish",
		},
		{
			name:     "dquotes removed",
			arg:      "cats \"eat\" fish",
			expected: "cats eat fish",
		},
		{
			name:     "lowered",
			arg:      "Cats Eat Fish",
			expected: "cats eat fish",
		},
		{
			name:     "dumb quote replaced",
			arg:      "cat’s eaten fish",
			expected: "cat's eaten fish",
		},
		{
			name:     "rejects low alphabetic content",
			arg:      "----- --- -a- ---a-dsbbca---asd--",
			expected: "",
		},
	}

	for _, c := range cs {
		t.Run(c.arg, func(t *testing.T) {
			result := clean([]byte(c.arg))
			if result != c.expected {
				t.Errorf("got '%v', expected '%v'", result, c.expected)
			}
		})
	}
}
