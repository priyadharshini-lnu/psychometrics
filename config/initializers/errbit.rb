Airbrake.configure do |config|
  config.host = 'https://errbit.sumatosoft.com'
  config.project_id = -1
  config.project_key = 'f0d332349d4336fd319efebbcacf97a5'

  # Uncomment for Rails apps
  config.environment = Rails.env
  config.ignore_environments = %w(development test)
end