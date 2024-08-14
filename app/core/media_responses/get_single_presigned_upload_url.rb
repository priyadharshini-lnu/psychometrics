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
      result = ObjectStorage::GetSingleSignedUploadUrl.call!(media, :asset, file_name)
      broadcast :ok, result
    end
  end
end
