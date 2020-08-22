#!/usr/bin/env bash
cd "$(dirname "$0")"
cd ..

if [ -z "$FPL_EMAIL" ]
  then
    echo "Please include the FPL_EMAIL variable"
    exit 1
fi

if [ -z "$FPL_PASSWORD" ]
  then
    echo "Please include the FPL_PASSWORD variable"
    exit 1
fi

./node_modules/.bin/jest ./lib/tests