# frozen_string_literal: true

module MediaResponses
  class GetSinglePresignedUploadUrl < BaseCommand
    private_attr_reader :question_id, :result, :file_name

    def initialize(result, question_id, file_name)
      @question_id = question_id
      @result = result
      @file_name = file_name
    end

    def call
      media = result.media_responses.find_or_create_by(question_id: question_id)
      storage_config = Rails.application.secrets.s3_compatible_storage
      signer = Aws::S3::Presigner.new
      url = signer.presigned_url(
        :put_object,
        bucket: Rails.application.secrets.s3_compatible_storage[:private_bucket],
        key: media.asset.key.gsub('${filename}', file_name),
        expires_in: 1800,
        use_accelerate_endpoint: Settings.aws.s3.accelerated
      )
      if storage_config[:proxy_endpoint]
        url = url.gsub(storage_config[:endpoint], storage_config[:proxy_endpoint])
      end

      broadcast :ok, { url: url }
    end
  end
end
