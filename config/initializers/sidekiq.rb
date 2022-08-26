# frozen_string_literal: true

require 'cron_jobs_loader'

redis_connection = if Rails.env.development?
                     { url: 'redis://localhost:6379/0' }
                   elsif ENV.key?('REDISTOGO_URL')
                     { url: ENV['REDISTOGO_URL'] }
                   elsif ENV.key?('REDIS_URL')
                     { url: ENV['REDIS_URL'], db: 0 }
                   else
                     { path: '/var/run/redis/redis.sock', db: 0 }
                   end

Sidekiq.configure_server do |config|
  pool_size = ENV.fetch('SIDEKIQ_DB_POOL', Sidekiq.options[:concurrency] + 2)
  config.redis = redis_connection.merge(size: pool_size)
  # Rails.application.config.after_initialize do
  #   Rails.logger.info("DB Connection Pool size for Sidekiq Server before disconnect
  # is: #{ActiveRecord::Base.connection.pool.instance_variable_get('@size')}")
  #   ActiveRecord::Base.connection_pool.disconnect!

  #   ActiveSupport.on_load(:active_record) do
  #     db_config = Rails.application.config.database_configuration[Rails.env]
  #     db_config['reaping_frequency'] = ENV['DATABASE_REAP_FREQ'] || 10 # seconds
  #     db_config['pool'] = pool_size
  #     ActiveRecord::Base.establish_connection(db_config)
  #     Rails.logger.info("DB Connection Pool size for Sidekiq Server is now:
  # #{ActiveRecord::Base.connection.pool.instance_variable_get('@size')}")
  #   end
  # end
end

Sidekiq.configure_client do |config|
  config.redis = redis_connection
end

# calling Sidekiq::Cron::Job is moved to application.rb in Rails.application.config.to_prepare
# due to new :zeitwerk loader
# https://guides.rubyonrails.org/v6.0/autoloading_and_reloading_constants.html
# CronJobsLoader.load_jobs is fired to load existing sidekiq jobs

Rails.logger = Sidekiq.logger if Sidekiq.server? && Rails.env.development?
