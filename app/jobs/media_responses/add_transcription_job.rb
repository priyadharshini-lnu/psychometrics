# frozen_string_literal: true

module MediaResponses
  class AddTranscriptionJob < ApplicationJob
    queue_as :default

    def perform(media_response_id)
      media_response = MediaResponse.find(media_response_id)

      case Settings.ai_transcription_provider.provider
        when 'oci'
          MediaResponses::Transcriptions::Oci.call!(media_response)
        when 'faas'
          MediaResponses::Transcriptions::Faas.call!(media_response)
        else
          raise "Unknown transcription provider: #{Settings.ai_transcription_provider.provider}"
      end
    end
  end
end
