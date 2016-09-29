if Rails.env.development?
  CarrierWave.configure do |config|
    config.storage = :file
    config.asset_host = ActionController::Base.asset_host
  end
else
  CarrierWave.configure do |config|
    config.fog_provider = 'fog/aws'
    config.fog_credentials = {
      provider: 'AWS',
      aws_access_key_id:     Rails.application.secrets.access_key_id,
      aws_secret_access_key: Rails.application.secrets.secret_access_key,
      region: Rails.application.secrets.region,
    }
    config.fog_directory = Rails.application.secrets.directory
    config.fog_attributes = { 'Cache-Control' => "max-age=#{365.day.to_i}" } # optional, defaults to {}
    config.asset_host = ''
    config.storage = :fog
  end
end
