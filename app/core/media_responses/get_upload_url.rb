# frozen_string_literal: true

module MediaResponses
  class GetUploadUrl < BaseCommand
    private_attr_reader :question_id, :result, :file_name, :blob

    def initialize(result, question_id, file_name = nil, blob = nil)
      @question_id = question_id
      @result = result
      @file_name = file_name
      @blob = blob
    end

    def call
      question = Question.find(question_id)
      begin
        data = if question.type == 'VideoResponse'
                 MediaResponses::GetMultipartUploadUrls.call!(result, question_id, file_name)
               else
                 ::MediaResponses::DirectUpload.call!(question_id, blob, result, file_name)
               end
        broadcast(:ok, data)
      rescue StandardError => e
        broadcast(:error, e)
      end
    end
  end
end
