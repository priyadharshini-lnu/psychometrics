# frozen_string_literal: true

module SystemCheckRecords
  class CompleteMultipartUpload < BaseCommand
    private_attr_reader :system_check_record, :asset_key, :upload_id, :parts, :file_size, :content_type, :checksum

    def initialize(system_check_record, options = {})
      @system_check_record = system_check_record
      @asset_key = options[:asset_key]
      @upload_id = options[:upload_id]
      @parts = options[:parts]
      @content_type = options[:content_type]
      @checksum = options[:checksum]
      @file_size = options[:file_size]
    end

    def call
      Aws::S3::Client.new.complete_multipart_upload({
        bucket: Settings.secrets.s3_compatible_storage[:private_bucket],
        key: asset_key,
        multipart_upload: {
          parts: parts.map { |part| part.permit!.to_h }
        },
        upload_id: upload_id
      })

      file_name = asset_key.split('/').last

      blob = ActiveStorage::Blob.create_before_direct_upload!(
        key: asset_key,
        filename: file_name,
        byte_size: file_size,
        checksum: checksum,
        content_type: content_type,
        service_name: Settings.storage.private_storage_service
      )

      ActiveStorage::Attachment.create!(
        name: 'media',
        record: system_check_record,
        blob: blob
      )

      system_check_record.passed = true
      system_check_record.save!
      system_check_record.reload

      broadcast(:ok, system_check_record)
    end
  end
end
