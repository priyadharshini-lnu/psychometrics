# frozen_string_literal: true

module OciSpeech
  module WebhookParser
    class << self
      def record_id(params)
        freeform_tags = extract_freeform_tags(params)
        freeform_tags['record_id'] || freeform_tags[:record_id]
      end

      def record_type(params)
        freeform_tags = extract_freeform_tags(params)
        freeform_tags['record_type'] || freeform_tags[:record_type]
      end

      def auth_token(params)
        freeform_tags = extract_freeform_tags(params)
        (freeform_tags['auth_token'] || freeform_tags[:auth_token]).presence
      end

      def admin_job_record_id(params)
        freeform_tags = extract_freeform_tags(params)
        freeform_tags['admin_job_record_id'] || freeform_tags[:admin_job_record_id]
      end

      def job_id(params)
        params.dig(:data, :resourceId)
      end

      def error_message(params)
        params.dig(:data, :additionalDetails, :errorMessage) || 'Unknown error'
      end

      def transcription_job_class(record_type)
        "#{record_type.pluralize}::SaveOciSpeechTranscriptionJob".constantize
      rescue NameError => e
        Rails.logger.error("Job class not found for #{record_type}: #{e.message}")
        nil
      end

      def find_record(params)
        record_id = record_id(params)
        record_type = record_type(params)

        return nil unless record_id && record_type

        record_class = record_type.constantize
        record_class.find_by(id: record_id)
      rescue NameError => e
        Rails.logger.error("Invalid record type: #{record_type} - #{e.message}")
        nil
      rescue StandardError => e
        Rails.logger.error("Failed to find #{record_type} with id #{record_id}: #{e.message}")
        nil
      end

      private

      def extract_freeform_tags(params)
        params.dig(:data, :freeformTags) || params.dig('data', 'freeformTags') || {}
      end
    end
  end
end
