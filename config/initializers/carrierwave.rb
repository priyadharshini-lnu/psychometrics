# frozen_string_literal: true

if Rails.env.test? || Rails.env.development?
  CarrierWave.configure do |config|
    config.asset_host = ActionController::Base.asset_host
    config.storage = :file
  end
else
  CarrierWave.configure do |config|
    config.fog_provider = 'fog/aws'
    config.fog_credentials = {
      provider: 'AWS',
      aws_access_key_id: Rails.application.secrets.access_key_id,
      aws_secret_access_key: Rails.application.secrets.secret_access_key,
      region: Rails.application.secrets.region
    }

    config.fog_directory = Rails.application.secrets.directory
    config.fog_attributes = { 'Cache-Control' => "max-age=#{365.day.to_i}" } # optional, defaults to {}
    config.storage = :fog
    config.use_action_status = true
    config.asset_host =
      if Settings.file_host.present?
        "#{Settings.protocol}://#{Settings.file_host}"
      else
        domain = "#{Rails.application.secrets.directory}.s3.dualstack.#{Rails.application.secrets.region}.amazonaws.com"
        "#{Settings.protocol}://#{domain}"
      end
  end
end
