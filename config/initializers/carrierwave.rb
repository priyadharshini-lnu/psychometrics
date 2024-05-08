# frozen_string_literal: true

silence_warnings do
  OpenSSL::SSL::VERIFY_PEER = OpenSSL::SSL::VERIFY_NONE if Rails.env.development?
end

s3_compatible_storage = Settings.secrets.s3_compatible_storage
Aws.config.update(
  region: s3_compatible_storage[:region],
  credentials: Aws::Credentials.new(
    s3_compatible_storage[:access_key_id],
    s3_compatible_storage[:secret_access_key]
  )
)

fog_credentials = if s3_compatible_storage[:provider] == 'aws'
                    {
                      provider: 'AWS',
                      aws_access_key_id: s3_compatible_storage[:access_key_id],
                      aws_secret_access_key: s3_compatible_storage[:secret_access_key],
                      region: s3_compatible_storage[:region]
                    }
                  else
                    Aws.config[:s3] = { force_path_style: true }
                    {
                      provider: 'AWS',
                      region: s3_compatible_storage[:region],
                      path_style: true,
                      aws_access_key_id: s3_compatible_storage[:access_key_id],
                      aws_secret_access_key: s3_compatible_storage[:secret_access_key],
                      enable_signature_v4_streaming: s3_compatible_storage[:provider] != 'oracle'
                    }
                  end
if s3_compatible_storage[:endpoint].present?
  fog_credentials = fog_credentials.merge(endpoint: s3_compatible_storage[:endpoint])
  Aws.config.update(endpoint: s3_compatible_storage[:endpoint])
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
    config.fog_directory = s3_compatible_storage[:public_bucket]
    config.fog_attributes = { 'Cache-Control' => "max-age=#{365.days.to_i}" } # optional, defaults to {}
    config.storage = :fog
    config.use_action_status = true
    config.validate_unique_filename = false
    config.fog_aws_accelerate = Settings.aws.s3.accelerated
    config.asset_host =
      if s3_compatible_storage[:provider] != 'aws'
        nil
      elsif Settings.file_host.present?
        "https://#{Settings.file_host}"
      else
        s3_endpoint =
          if Settings.aws.s3.accelerated
            's3-accelerate.dualstack'
          else
            "s3.dualstack.#{s3_compatible_storage[:region]}"
          end
        domain = "#{s3_compatible_storage[:public_bucket]}.#{s3_endpoint}.amazonaws.com"
        "https://#{domain}"
      end
  end
end
