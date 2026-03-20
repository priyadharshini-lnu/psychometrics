# frozen_string_literal: true

module MediaResponses
  class AddTranscriptionJob < ApplicationJob
    queue_as :default

    retry_on OCI::Errors::ServiceError, wait: :polynomially_longer, attempts: 5

    def perform(media_response_id)
      media_response = MediaResponse.find(media_response_id)

      case Settings.ai_transcription_provider.provider
        when 'oci'
          MediaResponses::Transcriptions::Oci.call!(media_response: media_response)
        when 'faas'
          MediaResponses::Transcriptions::Faas.call!(media_response: media_response)
      end
    end
  end
end
