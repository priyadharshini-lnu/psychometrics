# frozen_string_literal: true

require 'cron_jobs_loader'

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
  pool_size = ENV.fetch('SIDEKIQ_DB_POOL', Sidekiq.options[:concurrency] + 2)
  config.redis = redis_connection.merge(size: pool_size)
end

Sidekiq.configure_client do |config|
  config.redis = redis_connection
end

# calling Sidekiq::Cron::Job is moved to application.rb in Rails.application.config.to_prepare
# due to new :zeitwerk loader
# https://guides.rubyonrails.org/v6.0/autoloading_and_reloading_constants.html
# CronJobsLoader.load_jobs is fired to load existing sidekiq jobs

Rails.logger = Sidekiq.logger if Sidekiq.server? && Rails.env.development?
