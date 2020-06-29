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


# The Cookies returned are incompatible with node libraries, so we login here and set the response
# as an env variable, allowing the JS to parse them
export FPL_AUTH_HEADERS=$(curl -s https://users.premierleague.com/accounts/login/ \
  -H 'content-type: application/x-www-form-urlencoded' \
  --data-raw "login=$FPL_EMAIL&password=$FPL_PASSWORD&app=plfpl-web&redirect_uri=https%3A%2F%2Ffantasy.premierleague.com%2F" \
  -i -c cookies.txt)

if [[ $1 == *"draft-"* ]]; then
  export DRAFT_AUTH_HEADERS=$(curl -s https://draft.premierleague.com/api/bootstrap-dynamic -I -b cookies.txt)
fi

./node_modules/.bin/jest ./lib/tests