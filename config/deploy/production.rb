# frozen_string_literal: true

set :application,           'Psychometrics_Staging'
set :deploy_to,             '/var/www/apps/psychometrics_production'
set :rails_env,             'production'
ask :branch, `git rev-parse --abbrev-ref HEAD`.chomp

server '52.14.29.128', user: 'app', roles: %w[app db web]
