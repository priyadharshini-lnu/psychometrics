# frozen_string_literal: true

module UsersResults
  class CopyMediaResponsesJob < ApplicationJob
    def perform(from_user_result, to_user_result)
      from_user_result.media_responses.each do |media_response|
        UsersResults::CopyMediaResponseJob.perform_later(media_response, to_user_result,
                                                         media_response.transcription&.text)
      end
    end
  end
end
