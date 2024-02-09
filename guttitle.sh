#!/bin/bash

grep "*** START OF THE PROJECT GUTENBERG" | sed 's/^\*\*\* START OF THE PROJECT GUTENBERG EBOOK //' | sed 's/\*\*\*//'
