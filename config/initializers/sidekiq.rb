redis_connection = if Rails.env.development?
                     { url: 'redis://localhost:6379/0' }
                   else
                     { path: '/var/run/redis/redis.sock', db: 0 }
                   end

Sidekiq.configure_server do |config|
  config.redis = redis_connection
end

Sidekiq.configure_client do |config|
  config.redis = redis_connection
end
