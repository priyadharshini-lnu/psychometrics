# frozen_string_literal: true

module SpeedTest
  module S3TestUrls
    module_function

    def download_url(size: Config::DEFAULT_SIZE)
      key = test_file_key(size)
      ensure_test_file_exists(key, size)

      url = Config.generate_presigned_url(method: :get_object, key: key)
      { url: url, size: size, key: key }
    end

    def upload_url
      key = "#{Config::UPLOAD_PREFIX}/#{SecureRandom.uuid}_test_upload"

      url = Config.generate_presigned_url(method: :put_object, key: key)
      { url: url, key: key }
    end

    def ping_url
      key = test_file_key(Config::DEFAULT_SIZE)
      ensure_test_file_exists(key, Config::DEFAULT_SIZE)

      url = Config.generate_presigned_url(method: :head_object, key: key)
      { url: url, key: key }
    end

    def test_file_key(size)
      size_mb = (size / (1024.0 * 1024)).round(1)
      "#{Config::TEST_FILE_PREFIX}/test_#{size_mb}mb.bin"
    end

    def ensure_test_file_exists(key, size)
      return if file_exists?(key)

      create_test_file(key, size)
    end

    def file_exists?(key)
      Config.s3_client.head_object(bucket: Config.bucket_name, key: key)
      true
    rescue Aws::S3::Errors::NotFound
      false
    end

    def create_test_file(key, size)
      Config.s3_client.put_object(
        bucket: Config.bucket_name,
        key: key,
        body: Random.bytes(size),
        content_type: 'application/octet-stream'
      )
    end

    private_class_method :test_file_key, :ensure_test_file_exists, :file_exists?, :create_test_file
  end
end
