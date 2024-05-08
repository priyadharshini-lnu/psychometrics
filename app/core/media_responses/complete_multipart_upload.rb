# frozen_string_literal: true

module MediaResponses
  class CompleteMultipartUpload < BaseCommand
    private_attr_reader :media_response, :asset_key, :upload_id, :parts, :file_size, :content_type

    def initialize(media_response, options = {})
      @media_response = media_response
      @asset_key = options[:asset_key]
      @upload_id = options[:upload_id]
      @parts = options[:parts]
      @file_size = options[:file_size]
      @content_type = options[:content_type]
    end

    def call
      response = Aws::S3::Client.new.complete_multipart_upload({
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
        checksum: response.etag,
        content_type: content_type,
        service_name: 's3_private_bucket'
      )

      media_response.asset = blob.signed_id
      media_response.save!
      MediaResponses::MarkAsUserSelected.call!(media_response)
    end
  end
end
