#!/usr/bin/env bash

source majestic-api-key
export LC_ALL=C.UTF-8
export LANG=C.UTF-8

FLASK_APP=server.py flask run --host=0.0.0.0
