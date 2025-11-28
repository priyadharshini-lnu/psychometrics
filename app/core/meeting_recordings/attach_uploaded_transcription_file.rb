# frozen_string_literal: true

module MeetingRecordings
  class AttachUploadedTranscriptionFile < BaseCommand
    private_attr_reader :recording, :transcription_s3key

    def initialize(recording)
      @recording = recording
      @transcription_s3key = recording.transcription_s3key
    end

    def call
      attach_transcription_file
    end

    private

    def attach_transcription_file
      return if recording.transcription_file.attached?

      bucket = Settings.secrets.s3_compatible_storage[:dailyco_bucket]
      metadata = Utility::S3.metadata(s3key: transcription_s3key, bucket: bucket)
      byte_size = metadata[:byte_size]
      checksum = metadata[:checksum]
      content_type = 'text/vtt'

      blob = ActiveStorage::Blob.create_before_direct_upload!(
        key: transcription_s3key,
        filename: transcription_s3key,
        byte_size: byte_size,
        checksum: checksum,
        content_type: content_type,
        service_name: Settings.storage.dailyco_storage_service
      )

      recording.transcription_file.attach(blob)
    end
  end
end
