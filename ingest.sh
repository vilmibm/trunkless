#!/bin/bash

p="/home/vilmibm/pg_plaintext/files/"

while read book; do
  title=`cat $p$book | guttitle.sh`
  cat $p$book | gutcontent | phraser | gutingest "$book $title"
done
