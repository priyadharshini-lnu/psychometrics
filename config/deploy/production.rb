set :application,           'Psychometrics_Staging'
set :deploy_to,             '/var/www/apps/psychometrics_production'
set :rails_env,             'production'
set :branch,                'develop'

server '52.14.29.128', user: 'app', roles: %w{app db web}
