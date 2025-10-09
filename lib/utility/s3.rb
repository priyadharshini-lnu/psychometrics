# frozen_string_literal: true

module Utility
  class S3
    def self.metadata(s3key:, bucket: Settings.secrets.s3_compatible_storage[:private_bucket])
      s3_client = Aws::S3::Client.new(
        access_key_id: Settings.secrets.s3_compatible_storage[:access_key_id],
        secret_access_key: Settings.secrets.s3_compatible_storage[:secret_access_key],
        region: Settings.secrets.s3_compatible_storage[:region],
        endpoint: nil
      )

      digest = Digest::MD5.new
      resp = s3_client.get_object(bucket: bucket, key: s3key) do |chunk|
        digest.update(chunk)
      end

      {
        byte_size: resp.content_length,
        checksum: Base64.strict_encode64(digest.digest)
      }
    end
  end
end
