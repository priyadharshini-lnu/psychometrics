# frozen_string_literal: true

Raven.configure do |config|
  config.dsn = ENV.fetch('SENTRY_URL', '')
  config.excluded_exceptions = []
  config.current_environment = ENV.fetch('REAL_ENV', Rails.env)
end
