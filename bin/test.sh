#!/usr/bin/env bash

OUTPUT=$(yarn cli --path=./data/test.csv --query='PROJECT name FILTER city = "Berlin"')

if [[ $OUTPUT =~ "Alice" ]] && [[ $OUTPUT =~ "1 matching row" ]]; then
  echo "Test passed"
else
  echo "Test failed"
  exit 1
fi