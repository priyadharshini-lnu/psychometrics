Redis.current = Redis.new(host: ENV.fetch('REDIS_HOST', '127.0.0.1'), port: 6379)
