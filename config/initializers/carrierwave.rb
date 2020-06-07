# frozen_string_literal: true

if Rails.env.test?
  CarrierWave.configure do |config|
    config.asset_host = "#{Settings.protocol}://#{Settings.domain}:#{Settings.port}"
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
    config.fog_aws_accelerate = Settings.aws.s3.accelerated
    config.asset_host =
      if Settings.file_host.present?
        "https://#{Settings.file_host}"
      else
        s3_endpoint =
          if Settings.aws.s3.accelerated
            's3-accelerate.dualstack'
          else
            "s3.dualstack.#{Rails.application.secrets.region}"
          end
        domain = "#{Rails.application.secrets.directory}.#{s3_endpoint}.amazonaws.com"
        "https://#{domain}"
      end
  end
end
