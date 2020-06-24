#!/usr/bin/env bash
mkdir -p log
DATE=$(date +'%Y-%m-%d')

fpl-cli run $EMAIL $PASSWORD $TEAM_ID &> "log/$DATE.log"
