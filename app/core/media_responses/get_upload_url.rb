# frozen_string_literal: true

module MediaResponses
  class GetUploadUrl < BaseCommand
    def initialize(result, question_id)
      @question_id = question_id
      @result = result
    end

    def call
      question = Question.find(question_id)

      data = if question.type == 'VideoResponse'
               MediaResponses::GetMultipartUploadUrls.call!(result, question_id)
             else
               MediaResponses::GetSinglePresignedUploadUrl.call!(result, question_id)
             end

      broadcast(:ok, data)
    end

    private

    attr_reader :question_id, :result
  end
end
