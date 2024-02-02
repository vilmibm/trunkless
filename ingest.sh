#!/bin/bash

p="/home/vilmibm/pg_plaintext/files/"

while read book; do
  title=`grep "*** START OF THE PROJECT GUTENBERG" $p$book | sed 's/^\*\*\* START OF THE PROJECT GUTENBERG EBOOK //' | sed 's/\*\*\*//'`
  echo $book,$title
done
