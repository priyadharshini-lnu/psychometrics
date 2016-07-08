set :application,           'Psychometrics_Staging'
set :deploy_to,             '/var/www/apps/psychometrics_staging'
set :rails_env,             'staging'
set :branch,                'staging'

server '52.41.242.136', user: 'app', roles: %w{app db web}
