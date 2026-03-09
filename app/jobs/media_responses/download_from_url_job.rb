# frozen_string_literal: true

module MediaResponses
  class DownloadFromUrlJob < ApplicationJob
    queue_as :default

    def perform(url, user_result, question, transcription_text = nil, user_selected: true)
      MediaResponses::CreateFromMediaUrl.call!(
        url: url,
        user_result: user_result,
        question: question,
        transcription_text: transcription_text,
        user_selected: user_selected
      )
    end
  end
end
