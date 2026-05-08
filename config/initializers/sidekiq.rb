# frozen_string_literal: true

require 'cron_jobs_loader'
require 'sidekiq/throttled/web'

ssl_params = { verify_mode: OpenSSL::SSL::VERIFY_NONE }
redis_connection = if Rails.env.development?
                     { url: 'redis://localhost:6379/0', ssl_params: ssl_params }
                   elsif ENV.key?('REDISTOGO_URL')
                     { url: ENV['REDISTOGO_URL'], ssl_params: ssl_params }
                   elsif ENV.key?('REDIS_URL')
                     { url: ENV['REDIS_URL'], db: 0, ssl_params: ssl_params }
                   else
                     { path: '/var/run/redis/redis.sock', db: 0 }
                   end

Sidekiq.configure_server do |config|
  pool_size = ENV.fetch('SIDEKIQ_DB_POOL', (config[:concurrency] || 5) + 2).to_i
  config.redis = redis_connection.merge(size: pool_size)
  config.logger = SemanticLogger[Sidekiq]
end

Sidekiq.configure_client do |config|
  config.redis = redis_connection
  config.logger = SemanticLogger[Sidekiq]
end

# calling Sidekiq::Cron::Job is moved to application.rb in Rails.application.config.to_prepare
# due to new :zeitwerk loader
# https://guides.rubyonrails.org/v6.0/autoloading_and_reloading_constants.html
# CronJobsLoader.load_jobs is fired to load existing sidekiq jobs
