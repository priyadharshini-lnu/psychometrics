# config valid only for current version of Capistrano
lock '3.5.0'

set :application, 'Psychometrics'
set :repo_url, 'git@github.com:SumatoSoft/psychometrics.git'

# Default branch is :master
# ask :branch, `git rev-parse --abbrev-ref HEAD`.chomp

#  Multistage settings
#
set :stages, %w(staging production)
set :default_stage, 'staging'

# Default value for :scm is :git
set :scm, :git

set :ssh_options, {
  forward_agent: true
}

# Default value for :format is :airbrussh.
# set :format, :airbrussh

# You can configure the Airbrussh format using :format_options.
# These are the defaults.
# set :format_options, command_output: true, log_file: 'log/capistrano.log', color: :auto, truncate: :auto

# Default value for :pty is false
set :pty, true

# Default value for :linked_files is []
set :linked_files, fetch(:linked_files, []).push('config/database.yml', 'config/secrets.yml')

# Default value for linked_dirs is []
set :linked_dirs, fetch(:linked_dirs, []).push('log', 'tmp/pids', 'tmp/cache', 'tmp/sockets')

# Default value for default_env is {}
# set :default_env, { path: "/opt/ruby/bin:$PATH" }

# Default value for keep_releases is 5
set :keep_releases, 5

before 'deploy:started',  'devops:prepare_pid_files_dirs'

after 'deploy:published', 'deploy:cleanup'
after 'deploy:published', 'devops:flush_cache'

task :compress_assets_7z do
  on roles(:app) do
    assets_path = release_path.join('public', fetch(:assets_prefix))
    execute "find -L #{assets_path} \\( -name *.js -o -name *.css -o -name *.ico -o -name *.svg \\) -exec bash -c \"[ ! -f '{}.gz' ] && 7z a -tgzip -mx=9 '{}.gz' '{}'\" \\; "
  end
end

after 'deploy:normalize_assets', 'compress_assets_7z'
