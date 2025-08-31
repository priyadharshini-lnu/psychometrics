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

      bucket = Settings.secrets.s3_compatible_storage[:dailyco_bucket]
      metadata = Utility::S3.metadata(s3key: s3key, bucket: bucket)

      byte_size = metadata[:byte_size]
      checksum = metadata[:checksum]
      content_type = 'video/mp4'

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
  end
end
