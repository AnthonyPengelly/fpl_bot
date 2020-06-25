#!/usr/bin/env bash
cd "$(dirname "$0")"
cd ..
mkdir -p log
mkdir -p data
DATE=$(date +'%Y-%m-%d')

./bin/fpl-cli run $FPL_EMAIL $FPL_PASSWORD $FPL_TEAM_ID &> "log/$DATE.log"
cat "log/$DATE.log"
