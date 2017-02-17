set :application,           'Psychometrics_Staging'
set :deploy_to,             '/var/www/apps/psychometrics_staging'
set :rails_env,             'staging'
set :branch,                'develop'

server '35.163.230.93', user: 'app', roles: %w{app db web}
