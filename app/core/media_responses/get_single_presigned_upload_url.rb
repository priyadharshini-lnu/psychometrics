# frozen_string_literal: true

module MediaResponses
  class GetSinglePresignedUploadUrl < BaseCommand
    def initialize(result, question_id)
      @question_id = question_id
      @result = result
    end

    def call
      media = result.media_responses.find_or_create_by(question_id: question_id)
      uploader = media.asset
      uploader.success_action_status = '200'
      policy = uploader.policy do |conditons|
        conditons << ['starts-with', '$Content-Type', '']
      end
      data = {
        media_id: media.id,
        url: uploader.direct_fog_url,
        key: uploader.key,
        acl: uploader.acl,
        policy: policy,
        success_action_status: uploader.success_action_status,
        'x-amz-algorithm': uploader.algorithm,
        "x-amz-credential": uploader.credential,
        "x-amz-date": uploader.date,
        "x-amz-signature": uploader.signature
      }

      broadcast(:ok, data)
    end

    private

    attr_reader :question_id, :result
  end
end
