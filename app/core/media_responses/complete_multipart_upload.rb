# frozen_string_literal: true

module MediaResponses
  class CompleteMultipartUpload < BaseCommand
    private_attr_reader :media_response, :asset_key, :upload_id, :parts

    def initialize(media_response, asset_key, upload_id, parts)
      @media_response = media_response
      @asset_key = asset_key
      @upload_id = upload_id
      @parts = parts
    end

    def call
      media_response.asset_key = asset_key
      media_response.save!
      Aws::S3::Client.new.complete_multipart_upload({
        bucket: Settings.secrets.s3_compatible_storage[:private_bucket],
        key: asset_key,
        multipart_upload: {
          parts: parts.map { |part| part.permit!.to_h }
        },
        upload_id: upload_id
      })
      MediaResponses::MarkAsUserSelected.call!(media_response)
    end
  end
end
