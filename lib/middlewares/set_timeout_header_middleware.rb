# frozen_string_literal: true

module Middlewares
  class SetTimeoutHeaderMiddleware
    def initialize(app)
      @app = app
    end

    def call(env)
      status, headers, response = @app.call(env)

      if env['warden'].user
        user = env['warden'].user
        next_timeout_time = Time.current + user.timeout_in
        headers['X-Next-Timeout'] = (next_timeout_time.to_f * 1000).to_i.to_s
      end

      [status, headers, response]
    end
  end
end
