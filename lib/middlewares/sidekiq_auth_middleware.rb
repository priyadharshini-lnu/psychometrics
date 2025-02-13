# frozen_string_literal: true

module Middlewares
  class SidekiqAuthMiddleware
    def initialize(app)
      @app = app
    end

    def call(env)
      @request = ActionDispatch::Request.new(env)

      return @app.call(env) unless should_use?

      user = env['warden'].user

      if user&.is?(:superadmin) && !pending_two_factor_authentication?(env)
        @app.call(env)
      else
        handle_auth_failure
      end
    end

    private

    def handle_auth_failure
      [302, { 'Location' => '/users/sign_in', 'Content-Type' => 'text/html' }, ['Redirecting to login...']]
    end

    def should_use?
      return false unless Rails.env.production?

      @request.path =~ %r{^/sidekiq}
    end

    def pending_two_factor_authentication?(env)
      env['warden'].session(:user)[TwoFactorAuthentication::NEED_AUTHENTICATION]
    end
  end
end
