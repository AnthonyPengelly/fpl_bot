#!/usr/bin/env bash
cd "$(dirname "$0")"
cd ..
mkdir -p log
mkdir -p data
DATE=$(date +'%Y-%m-%d')

./bin/fpl-cli run &> "log/$DATE.log"
cat "log/$DATE.log"
