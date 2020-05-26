# frozen_string_literal: true

module MediaResponses
  class CompleteMultipartUpload < BaseCommand
    private_attr_reader :media_response, :upload_id, :parts

    def initialize(media_response, upload_id, parts)
      @media_response = media_response
      @upload_id = upload_id
      @parts = parts
    end

    def call
      media_response.asset_key = media_response.video_file_path
      media_response.save!
      Aws::S3::Client.new.complete_multipart_upload({
        bucket: Rails.application.secrets.directory,
        key: media_response.video_file_path,
        multipart_upload: {
          parts: parts.map { |part| part.permit!.to_h }
        },
        upload_id: upload_id
      })
    end
  end
end
