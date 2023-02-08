# frozen_string_literal: true

Sentry.init do |config|
  config.dsn = ENV.fetch('SENTRY_URL', '')
  config.breadcrumbs_logger = [:active_support_logger]
  config.traces_sample_rate = 0.5
  config.excluded_exceptions += [
    'ActionController::RoutingError', 'ActionController::InvalidAuthenticityToken', 'Hogan::Exceptions::ReportNotFound'
  ]
  config.environment = ENV.fetch('REAL_ENV', Rails.env)
end
