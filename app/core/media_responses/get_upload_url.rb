# frozen_string_literal: true

module MediaResponses
  class GetUploadUrl < BaseCommand
    private_attr_reader :question_id, :result, :file_name, :blob_params

    def initialize(result:, question_id:, blob_params:, file_name:)
      @question_id = question_id
      @result = result
      @file_name = file_name
      @blob_params = blob_params
    end

    def call
      question = Question.find(question_id)
      begin
        data = if question.type == 'VideoResponse'
                 MediaResponses::GetMultipartUploadUrls.call!(result, question_id, file_name)
               else
                 media = result.media_responses.create!(question_id: question_id)
                 ::ObjectStorage::GetSingleSignedUploadUrl.call!(
                   model: media, field: :asset, blob_params: blob_params, file_name: file_name
                 )
               end
        broadcast(:ok, data)
      rescue StandardError => e
        broadcast(:error, e)
      end
    end
  end
end
