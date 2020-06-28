#!/usr/bin/env bash
cd "$(dirname "$0")"
cd ..

DATE=$(date +'%Y/%m/%d')
FOLDER_DATE=$(date +'%Y/%m')
mkdir -p "draft-log/$FOLDER_DATE"

./bin/fpl-cli draft-run &> "draft-log/$DATE.txt"
cat "draft-log/$DATE.txt"
