# frozen_string_literal: true

require 'oci'

module MediaResponses
  module Transcriptions
    class Oci < BaseCommand
      attr_reader :media_response, :admin_job_record_id

      def initialize(options)
        @media_response = options[:media_response]
        @admin_job_record_id = options[:admin_job_record_id]
      end

      def call
        broadcast :ok, start_transcription_job
      rescue StandardError => e
        error_details = { message: e.message }
        media_response.save_transcription_failed!(error_details)
        Rails.logger.error("OCI Speech Transcription failed: #{e.message}")
        raise
      end

      private

      def speech_client
        @speech_client ||= OCI::AiSpeech::AIServiceSpeechClient.new(config: Psy::Oci.config)
      end

      def start_transcription_job
        return unless media_response.asset.attached?

        media_response.save_transcription_status!(:pending)
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
            language_code: 'auto'
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
            auth_token: JWT.encode({ sub: 'transcription' }, Settings.secrets.webhook_jwt_secret, 'HS256'),
            admin_job_record_id: admin_job_record_id.to_s
          }
        )
      end
    end
  end
end
