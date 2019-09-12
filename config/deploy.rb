# frozen_string_literal: true

# config valid only for current version of Capistrano
lock '3.6.0'

set :application, 'Psychometrics'
set :repo_url, 'git@gitlab.com:tte-lighthouse/psychometrics.git'

# Default branch is :master
# ask :branch, `git rev-parse --abbrev-ref HEAD`.chomp

#  Multistage settings
#
set :stages, %w[staging production]
set :default_stage, 'staging'

# Default value for :scm is :git
set :scm, :git

set :ssh_options,
    forward_agent: true

set :sidekiq_queue, %w[reports mailers communication default]

# Default value for :pty is false
set :pty, false

# Default value for :linked_files is []
set :linked_files, fetch(:linked_files, []).push('config/database.yml', 'config/secrets.yml', 'config/application.yml')

# Default value for linked_dirs is []
set :linked_dirs, fetch(:linked_dirs, []).
  push('log', 'tmp/pids', 'tmp/cache', 'tmp/sockets', 'tmp/reports', 'tmp/bulk_reports')

# Default value for default_env is {}
# set :default_env, { path: "/opt/ruby/bin:$PATH" }

# Default value for keep_releases is 5
set :keep_releases, 10
# rubocop:disable Metrics/LineLength
task :compress_assets do
  on roles(:app) do
    assets_path = release_path.join('public', 'assets')
    execute "find -L #{assets_path} \\( -name *.js -o -name *.css -o -name *.ico -o -name *.svg \\) -exec bash -c \"[ ! -f '{}.gz' ] && zopfli --gzip --i20 '{}'\" \\; "
  end
end

task :compress_png do
  on roles(:app) do
    assets_path = release_path.join('public', 'assets')
    execute "find -L #{assets_path} \\( -name *.png \\) -not \\( -name 'zopflied_*.png' \\) -exec bash -c 'FULLPATH='{}'; FILENAME=${FULLPATH##*/}; BASEDIRECTORY=${FULLPATH%$FILENAME}; [ ! -f \"${BASEDIRECTORY}zopflied_${FILENAME}\" ] && zopflipng \"${FULLPATH}\" \"${BASEDIRECTORY}zopflied_${FILENAME}\" ' \\; "
  end
end
# rubocop:enable Metrics/LineLength
after 'deploy:normalize_assets', 'compress_assets'
after 'deploy:normalize_assets', 'compress_png'
