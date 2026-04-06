# frozen_string_literal: true

module OciSpeech
  class EventProcessor < BaseCommand
    private_attr_reader :params

    def initialize(params)
      @params = params
    end

    def call
      unless record
        update_admin_job_failed(I18n.t('admin.transcription_record_not_found'))
        broadcast :ok, :ok
        return
      end

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
      save_transcription_error_details(e.message, e.backtrace)
      broadcast :ok, :unprocessable_entity
    end

    private

    def event_type
      params[:eventType]
    end

    def handle_job_created
      record.save_transcription_status!(:processing)
      update_admin_job_progress
    end

    def handle_job_completed
      job_id = WebhookParser.job_id(params)
      job_class = WebhookParser.transcription_job_class(WebhookParser.record_type(params))
      admin_job_record_id = WebhookParser.admin_job_record_id(params)
      options = {
        record_id: WebhookParser.record_id(params),
        job_id: job_id,
        admin_job_record_id: admin_job_record_id
      }
      job_class&.perform_later(options)
    end

    def handle_job_failed
      error_message = WebhookParser.error_message(params)
      save_transcription_error_details(error_message)
    end

    def save_transcription_error_details(error_message, backtrace = nil)
      error_details = { message: error_message }
      error_details[:backtrace] = backtrace if backtrace.present?
      record.save_transcription_failed!(error_details)
      update_admin_job_failed(error_message)
    end

    def update_admin_job_failed(error_message)
      return unless admin_job

      formatted_error = "MediaResponse ##{record&.id}: #{error_message}"
      admin_job.with_lock do
        current_errors = admin_job.error_messages || []
        admin_job.update!(
          status: :failed,
          error_messages: current_errors + [formatted_error]
        )
      end
      admin_job.increment_completed_tasks!
    end

    def record
      @record ||= WebhookParser.find_record(params)
    end

    def admin_job
      @admin_job ||= AdminJobRecord.find_by(id: WebhookParser.admin_job_record_id(params))
    end

    def update_admin_job_progress
      return unless admin_job

      admin_job.increment_completed_tasks!
      admin_job.complete! if admin_job.total_tasks == admin_job.completed_tasks
    end
  end
end
