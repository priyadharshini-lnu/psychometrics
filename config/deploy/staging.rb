set :application,           'Psychometrics_Staging'
set :deploy_to,             '/var/www/apps/psychometrics_staging'
set :rails_env,             'staging'
ask :branch, `git rev-parse --abbrev-ref HEAD`.chomp

server '52.14.255.191', user: 'app', roles: %w{app db web}
