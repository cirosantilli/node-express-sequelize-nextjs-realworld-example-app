#!/usr/bin/env bash
cmd="$1"
shift
heroku "$cmd" --app cirosantilli-realworld-next "$@"
