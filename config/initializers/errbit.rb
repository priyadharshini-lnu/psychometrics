Airbrake.configure do |config|
  config.host = 'https://errbit.dokku.shabandri.com'
  config.project_id = 1
  config.project_key = 'bc509628ae8271e7cfa63778a922d2d1'

  # Uncomment for Rails apps
  config.environment = ENV['PIPELINE_STAGE'] || Rails.env
  config.ignore_environments = %w(development test)
end