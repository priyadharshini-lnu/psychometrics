# frozen_string_literal: true

module OciSpeech
  class EventProcessor < BaseCommand
    private_attr_reader :params

    def initialize(params)
      @params = params
    end

    def call
      case event_type
        when 'com.oraclecloud.aiservicespeech.createtranscriptionjob'
          handle_job_created
        when 'com.oraclecloud.aiservicespeech.completedtranscriptionjob'
          handle_job_completed
        when 'com.oraclecloud.aiservicespeech.failedtranscriptionjob'
          handle_job_failed
        else
          Rails.logger.warn("Unknown event type: #{event_type}")
      end

      broadcast :ok, :ok
    rescue StandardError => e
      Rails.logger.error("Webhook processing failed: #{e.message}")
      Rails.logger.error(e.backtrace.join("\n"))
      broadcast :ok, :unprocessable_entity
    end

    private

    def event_type
      params[:eventType]
    end

    def handle_job_created
      record&.update!(transcription_status: :processing)
    end

    def handle_job_completed
      return unless record

      job_id = WebhookParser.job_id(params)
      job_class = WebhookParser.transcription_job_class(WebhookParser.record_type(params))
      job_class&.perform_later(WebhookParser.record_id(params), job_id)
    end

    def handle_job_failed
      error_message = WebhookParser.error_message(params)
      return unless record

      record.update!(transcription_status: :failed)
      Rails.logger.error(
        "Transcription job failed for #{WebhookParser.record_type(params)} " \
        "#{WebhookParser.record_id(params)}: #{error_message}"
      )
    end

    def record
      @record ||= WebhookParser.find_record(params)
    end
  end
end
