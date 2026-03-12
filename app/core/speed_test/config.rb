# frozen_string_literal: true

module SpeedTest
  module Config
    MIN_SIZE = 1024 # 1KB minimum
    MAX_SIZE = 10 * 1024 * 1024 # 10MB max
    DEFAULT_SIZE = 5 * 1024 * 1024 # 5MB default
    URL_EXPIRATION = 5.minutes
    TEST_FILE_PREFIX = 'speed_test/test_files'
    UPLOAD_PREFIX = 'speed_test/uploads'

    module_function

    def clamp_size(size)
      size.to_i.clamp(MIN_SIZE, MAX_SIZE)
    end

    def generate_presigned_url(method:, key:, **)
      s3_presigner.presigned_url(
        method,
        bucket: bucket_name,
        key: key,
        expires_in: URL_EXPIRATION.to_i,
        **
      )
    end

    def bucket_name
      Settings.secrets.s3_compatible_storage[:private_bucket]
    end

    def s3_client
      @s3_client ||= Aws::S3::Client.new(s3_config)
    end

    def s3_presigner
      @s3_presigner ||= Aws::S3::Presigner.new(client: s3_client)
    end

    def s3_config
      config = {
        region: Settings.secrets.s3_compatible_storage[:region],
        access_key_id: Settings.secrets.s3_compatible_storage[:access_key_id],
        secret_access_key: Settings.secrets.s3_compatible_storage[:secret_access_key]
      }

      endpoint = Settings.secrets.s3_compatible_storage[:endpoint]
      config[:endpoint] = endpoint if endpoint.present?

      config
    end

    private_class_method :s3_config
  end
end
