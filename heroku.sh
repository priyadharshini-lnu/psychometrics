#!/bin/bash

set -x

if [[ $DYNO == "web"* ]]; then
  bundle exec falcon host
elif  [[ $DYNO == "worker"* ]]; then
  bundle exec sidekiq -C config/sidekiq.yml
elif  [[ $DYNO == "release"* ]]; then
  rake db:migrate
  exit 0
fi
