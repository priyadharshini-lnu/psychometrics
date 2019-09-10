# frozen_string_literal: true

set :application,           'Psychometrics_Staging'
set :deploy_to,             '/var/www/apps/psychometrics_staging'
set :rails_env,             'staging'
ask :branch, `git rev-parse --abbrev-ref HEAD`.chomp

server '18.191.168.184', user: 'app', roles: %w[app db web]
