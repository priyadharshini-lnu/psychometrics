# frozen_string_literal: true

module CampaignReports
  class ProcessExtractedFiles < BaseCommand
    private_attr_reader :campaign_report, :data, :campaign, :admin_job, :errors

    def initialize(campaign_report, data, admin_job)
      @campaign_report = campaign_report
      @data = data
      @campaign = campaign_report.campaign
      @admin_job = admin_job
      @errors = []
    end

    def call
      admin_job.update!(status: :in_progress, total_tasks: data['total_files'])

      if data['files'].blank?
        errors << I18n.t('administration.campaign_report.bulk_assets_upload.errors.no_file_found_in_extracted_zip')
        return finalize_admin_job
      end

      missing_ids = user_report_ids - user_reports_by_ids.keys
      missing_emails = data['files'].filter_map do |file_data|
        file_data['email'] if missing_ids.include?(file_data['user_report_id'])
      end

      if missing_ids.any?
        errors << I18n.t(
          'administration.campaign_report.bulk_assets_upload.errors.missing_user_reports',
          emails: missing_emails.join(', ')
        )
        return finalize_admin_job
      end

      prepared_user_report_ids = data['files'].filter_map do |file_data|
        attach_one_file(file_data)
      end

      UserReport.where(id: prepared_user_report_ids).update_all(status: :prepared) if prepared_user_report_ids.any?

      finalize_admin_job
    rescue StandardError => e
      errors << I18n.t(
        'administration.campaign_report.bulk_assets_upload.errors.file_processing_error',
        error_message: e.message
      )
      finalize_admin_job
    end

    private

    def user_report_ids
      @user_report_ids ||= data['files'].pluck('user_report_id').uniq
    end

    def user_reports_by_ids
      @user_reports_by_ids ||= campaign_report.user_reports.where(
        id: user_report_ids
      ).index_by(&:id)
    end

    def user_report_pdfs_by_user_report_id
      @user_report_pdfs_by_user_report_id ||= UserReportPdf.where(
        id: data['files'].pluck('report_pdf_id').uniq
      ).index_by(&:user_report_id)
    end

    def attach_one_file(file_data)
      user_report_id = file_data['user_report_id']
      user_report = user_reports_by_ids[user_report_id]

      unless user_report
        errors << I18n.t(
          'administration.campaign_report.bulk_assets_upload.errors.user_report_not_found',
          email: file_data['email']
        )
        return
      end

      report_pdf = user_report_pdfs_by_user_report_id[user_report_id]

      report_pdf ||= user_report.report_pdfs.find_or_create_by!(locale: user_report.effective_default_language)

      report_pdf.pdf_file.purge_later if report_pdf.pdf_file.attached?

      blob = ActiveStorage::Blob.create_before_direct_upload!(
        key: file_data['file_path'],
        filename: file_data['file_name'],
        byte_size: file_data['file_size'],
        checksum: file_data['checksum'],
        content_type: file_data['content_type'],
        service_name: Settings.storage.private_storage_service
      )

      pdf_file_attachment = ActiveStorage::Attachment.new(
        record_id: report_pdf.id,
        record_type: report_pdf.class.name,
        name: 'pdf_file'
      )

      pdf_file_attachment.blob_id = blob.id

      report_pdf.pdf_file_attachment = pdf_file_attachment
      report_pdf.set_generated_timestamps

      if report_pdf.save
        admin_job.increment!(:completed_tasks)
      else
        errors << I18n.t(
          'administration.campaign_report.bulk_assets_upload.errors.failed_to_attach_file',
          email: file_data['email'],
          error_message: user_report.errors.full_messages.join(', ')
        )
      end
      user_report_id
    end

    def finalize_admin_job
      if errors.any?
        admin_job.update!(status: :failed, error_messages: errors.join(', '))
      else
        admin_job.update!(status: :completed)
      end
    end
  end
end
