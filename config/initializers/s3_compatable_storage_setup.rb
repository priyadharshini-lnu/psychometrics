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

if s3_compatible_storage[:endpoint].present?
  Aws.config.update(endpoint: s3_compatible_storage[:endpoint])
end
