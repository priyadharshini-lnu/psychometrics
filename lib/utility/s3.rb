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

      s3_object = s3_client.get_object_attributes(
        bucket: bucket,
        key: s3key,
        object_attributes: %w[Checksum ObjectSize]
      )

      {
        byte_size: s3_object.object_size,
        checksum: s3_object.checksum.checksum_crc64nvme
      }
    end
  end
end
