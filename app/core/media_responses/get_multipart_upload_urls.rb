# frozen_string_literal: true

module MediaResponses
  class GetMultipartUploadUrls < BaseCommand
    private_attr_reader :result, :question_id

    def initialize(result, question_id)
      @question_id = question_id
      @result = result
    end

    def call
      media = result.media_responses.create!(question_id: question_id)

      urls = []
      signer = Aws::S3::Presigner.new
      key = media.video_file_path
      multipart_request = Aws::S3::Client.new.create_multipart_upload(
        bucket: Rails.application.secrets.directory, key: key, acl: media.asset.acl
      )
      number_of_urls.times do |time|
        part_number = (time + 1).to_s
        urls << signer.presigned_url(
          :upload_part,
          bucket: Rails.application.secrets.directory,
          key: key,
          upload_id: multipart_request.upload_id,
          part_number: part_number,
          expires_in: 1800,
          use_accelerate_endpoint: Settings.aws.s3.accelerated
        )
      end

      broadcast(:ok, {
        media_id: media.id,
        asset_key: key,
        upload_id: multipart_request.upload_id,
        urls: urls
      })
    end

    private

    def number_of_urls
      question = Question.find(question_id)
      duration = question.props['duration'] || 10

      (duration / 10.0).ceil
    end
  end
end
