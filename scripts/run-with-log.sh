#!/usr/bin/env bash
cd "$(dirname "$0")"
cd ..

DATE=$(date +'%Y/%m/%d')
FOLDER_DATE=$(date +'%Y/%m')
mkdir -p "log/$FOLDER_DATE"

./bin/fpl-cli run &> "log/$DATE.txt"
cat "log/$DATE.txt"
