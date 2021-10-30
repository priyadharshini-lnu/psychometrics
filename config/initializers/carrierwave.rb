# frozen_string_literal: true

fog_credentials = {
  provider: 'AWS',
  aws_access_key_id: Rails.application.secrets.access_key_id,
  aws_secret_access_key: Rails.application.secrets.secret_access_key,
  region: Rails.application.secrets.region
}

OpenSSL::SSL::VERIFY_PEER = OpenSSL::SSL::VERIFY_NONE if Rails.env.development?

fog_credentials = if ENV['MINIO_ENDPOINT'].present?
                    Aws.config.update(
                      endpoint: ENV['MINIO_ENDPOINT'],
                      force_path_style: true
                    )
                    {
                      provider: 'AWS',
                      aws_access_key_id: Rails.application.secrets.minio[:access_key_id],
                      aws_secret_access_key: Rails.application.secrets.minio[:secret_access_key],
                      endpoint: ENV['MINIO_ENDPOINT'],
                      path_style: true
                    }
                  else
                    {
                      provider: 'AWS',
                      aws_access_key_id: Rails.application.secrets.access_key_id,
                      aws_secret_access_key: Rails.application.secrets.secret_access_key,
                      region: Rails.application.secrets.region
                    }
                  end

if Rails.env.test?
  CarrierWave.configure do |config|
    config.asset_host = "#{Settings.protocol}://#{Settings.domain}:#{Settings.port}"
    config.storage = :file
  end
else
  CarrierWave.configure do |config|
    config.fog_provider = 'fog/aws'
    config.fog_credentials = fog_credentials
    config.fog_directory = Rails.application.secrets.directory
    config.fog_attributes = { 'Cache-Control' => "max-age=#{365.day.to_i}" } # optional, defaults to {}
    config.storage = :fog
    config.use_action_status = true
    config.validate_unique_filename = false
    config.fog_aws_accelerate = Settings.aws.s3.accelerated
    config.asset_host =
      if ENV['MINIO_ENDPOINT'].present?
        nil
      elsif Settings.file_host.present?
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
