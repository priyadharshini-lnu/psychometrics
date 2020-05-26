
# frozen_string_literal: true

module MediaResponses
  class GetMultipartUploadUrls < BaseCommand
    private_attr_reader :result, :question_id

    def initialize(result, question_id)
      @question_id = question_id
      @result = result
    end

    def call
      media = result.media_responses.find_or_create_by(question_id: question_id)

      urls = []
      signer = Aws::S3::Presigner.new
      multipart_request = Aws::S3::Client.new.create_multipart_upload(
        bucket: Rails.application.secrets.directory, key: media.video_file_path, acl: media.asset.acl
      )
      4.times do |time|
        part_number = (time + 1).to_s
        urls << signer.presigned_url(
          :upload_part,
          bucket: Rails.application.secrets.directory,
          key: media.video_file_path,
          upload_id: multipart_request.upload_id,
          part_number: part_number,
          expires_in: 1800
        )
      end

      broadcast(:ok, {
        media_id: media.id,
        upload_id: multipart_request.upload_id,
        urls: urls
      })
    end
  end
end
