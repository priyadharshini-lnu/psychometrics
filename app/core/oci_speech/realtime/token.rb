# frozen_string_literal: true

require 'oci'

module OciSpeech
  module Realtime
    class Token < BaseCommand
      def call
        response = speech_client.create_realtime_session_token(token_details)
        broadcast :ok, build_result(response.data)
      rescue StandardError => e
        Rails.logger.error("OCI Realtime Speech token generation failed: #{e.message}")
        broadcast :error, e.message
      end

      private

      def speech_client
        @speech_client ||= OCI::AiSpeech::AIServiceSpeechClient.new(config: Psy::Oci.config)
      end

      def token_details
        OCI::AiSpeech::Models::CreateRealtimeSessionTokenDetails.new(
          compartment_id: Settings.secrets.oci.compartment_id
        )
      end

      def build_result(token_data)
        {
          token: token_data.token,
          compartment_id: token_data.compartment_id,
          session_id: token_data.session_id,
          region: Settings.secrets.oci.default_region
        }
      end
    end
  end
end
