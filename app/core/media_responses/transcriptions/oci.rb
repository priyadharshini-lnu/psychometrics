# frozen_string_literal: true

require 'oci'

module MediaResponses
  module Transcriptions
    class Oci < BaseCommand
      attr_reader :media_response

      APP_TO_WHISPER_LOCALE_MAP = {
        'cn' => 'zh',
        'en-GB' => 'en',
        'en-US' => 'en',
        'es-ES' => 'es',
        'pt-BR' => 'pt',
        'zh-TW' => 'zh',
        'zh-HK' => 'zh',
        'zh-Hant' => 'zh',
        'sr-Cyrl' => 'sr',
        'sr-Latn' => 'sr'
      }.freeze

      def initialize(media_response)
        @media_response = media_response
      end

      def call
        broadcast :ok, start_transcription_job
      rescue StandardError => e
        media_response.update!(transcription_status: :failed)
        Rails.logger.error("OCI Speech Transcription failed: #{e.message}")
        raise
      end

      private

      def speech_client
        @speech_client ||= OCI::AiSpeech::AIServiceSpeechClient.new(config: Psy::Oci.config)
      end

      def start_transcription_job
        return unless media_response.asset.attached?

        media_response.update!(transcription_status: :pending)
        job_details = build_transcription_job_details
        response = speech_client.create_transcription_job(job_details)
        job_id = response.data.id

        Rails.logger.info("Started OCI transcription job: #{job_id} for MediaResponse: #{media_response.id}")

        job_id
      end

      def build_transcription_job_details
        compartment_id = Settings.secrets.oci.compartment_id
        namespace = Settings.secrets.oci.namespace
        bucket_name = Settings.secrets.s3_compatible_storage.private_bucket
        user_locale = media_response.users_result.user_assessment.selected_locale
        language_code = APP_TO_WHISPER_LOCALE_MAP[user_locale.to_s] || user_locale
        input_object_name = media_response.asset.key

        OCI::AiSpeech::Models::CreateTranscriptionJobDetails.new(
          compartment_id: compartment_id,
          display_name: MediaResponses::OciTranscriptionDecorator.job_name(media_response),
          input_location: OCI::AiSpeech::Models::ObjectListInlineInputLocation.new(
            object_locations: [
              OCI::AiSpeech::Models::ObjectLocation.new(
                namespace_name: namespace,
                bucket_name: bucket_name,
                object_names: [input_object_name]
              )
            ]
          ),
          output_location: OCI::AiSpeech::Models::OutputLocation.new(
            namespace_name: namespace,
            bucket_name: bucket_name,
            prefix: 'private/transcriptions'
          ),
          model_details: OCI::AiSpeech::Models::TranscriptionModelDetails.new(
            model_type: Settings.ai_transcription_provider.model,
            language_code: language_code
          ),
          normalization: OCI::AiSpeech::Models::TranscriptionNormalization.new(
            is_punctuation_enabled: true,
            filters: [
              OCI::AiSpeech::Models::ProfanityTranscriptionFilter.new(
                type: 'PROFANITY', mode: 'MASK'
              )
            ]
          ),
          freeform_tags: {
            record_id: media_response.id.to_s,
            record_type: media_response.class.name,
            auth_token: JWT.encode({ sub: 'transcription' }, Settings.secrets.webhook_jwt_secret, 'HS256')
          }
        )
      end
    end
  end
end
