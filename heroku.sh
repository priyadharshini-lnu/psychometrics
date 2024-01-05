#!/bin/bash

set -x

if [[ $DYNO == "web"* ]]; then
  bundle exec puma -t 5:5 -p ${PORT:-3000} -e ${RACK_ENV:-development}
elif  [[ $DYNO == "worker"* ]]; then
  bundle exec sidekiq -C config/sidekiq.yml
elif  [[ $DYNO == "release"* ]]; then
  rake db:migrate
fi
