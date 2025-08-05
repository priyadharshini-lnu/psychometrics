# frozen_string_literal: true

module MeetingRecordings
  class AttachUploadedRecording < BaseCommand
    private_attr_reader :recording, :s3key

    def initialize(recording)
      @recording = recording
      @s3key = recording.s3key
    end

    def call
      attach_recording_file
    end

    private

    def attach_recording_file
      return if recording.recording_file.attached?

      s3_object = fetch_s3_object

      byte_size = s3_object.object_size
      content_type = 'video/mp4'
      checksum = s3_object.checksum.checksum_crc64nvme

      blob = ActiveStorage::Blob.create_before_direct_upload!(
        key: s3key,
        filename: s3key,
        byte_size: byte_size,
        checksum: checksum,
        content_type: content_type,
        service_name: Settings.storage.dailyco_storage_service
      )

      recording.recording_file.attach(blob)
    end

    def s3_client
      Aws::S3::Client.new(
        access_key_id: Settings.secrets.s3_compatible_storage[:access_key_id],
        secret_access_key: Settings.secrets.s3_compatible_storage[:secret_access_key],
        region: Settings.secrets.s3_compatible_storage[:region],
        endpoint: nil
      )
    end

    def fetch_s3_object
      bucket = Settings.secrets.s3_compatible_storage[:dailyco_bucket]

      s3_client.get_object_attributes(
        bucket: bucket,
        key: s3key,
        object_attributes: %w[Checksum ObjectSize]
      )
    end
  end
end
