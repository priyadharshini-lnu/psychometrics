# frozen_string_literal: true

module Idp
  class BulkDownload < BaseCommand
    include Rails.application.routes.url_helpers

    private_attr_reader :user_idp_plans, :current_user, :bulk_report, :job_record

    def initialize(current_user:, job_record:, user_idp_plans: nil)
      @user_idp_plans = user_idp_plans
      @current_user = current_user
      @job_record = job_record
      @bulk_report = ::BulkReport.create(user: current_user)
    end

    def call
      unless user_idp_plans_with_pdf.exists?
        return broadcast :ok, { error_messages: [I18n.t('administration.bulk_reports.reports_unavailable')] }
      end

      if Settings.features.zip_s3_files_faas
        bulk_download_with_faas
        broadcast :waiting
      else
        bulk_download_without_faas
        broadcast :ok, bulk_report
      end
    end

    private

    def bulk_download_with_faas
      file_details = user_idp_plans_with_pdf.each_with_object([]) do |ur, acc|
        locale = job_record.data['lang']
        pdf_path = ur.report_pdfs.find_by(locale: locale).pdf_file.key
        pdf_path && (acc << {
          s3FilePath: pdf_path,
          zipOutputFilePath: "#{ur.user.email}/#{ur.campaign_id}-lang-#{locale}.pdf"
        })
      end
      file_name = "bulk-report-#{Time.zone.today.strftime('%F')}"
      webhook_message = { bulk_report_id: bulk_report.id, file_name: file_name, admin_job_record_id: job_record.id }
      job_record.update!(total_tasks: file_details.length)
      Faas::ZipS3Files.call!(
        file_details: file_details,
        zip_file_key: bulk_report.attachment_storage_path('files', "#{file_name}.zip"),
        webhook_message: webhook_message
      )
    end

    def bulk_download_without_faas
      create_input_directory
      download_idp_reports_from_s3

      ::BulkReports::CompressJob.perform_now(bulk_report)
      BulkReportMailer.notify(bulk_report).deliver_later

      FileUtils.rm_rf(bulk_report.input_dir)

      broadcast :ok, bulk_report
    end

    def create_input_directory
      input_dir = bulk_report.input_dir

      FileUtils.rm_rf(input_dir) if File.directory?(bulk_report.input_dir)

      FileUtils.mkdir_p(input_dir)
    end

    def download_idp_reports_from_s3
      user_idp_plans_with_pdf.each do |user_plan|
        lang = job_record.data['lang']
        pdf_url = user_plan.pdf_url(
          locale: lang,
          include_reflective_questions: job_record.data['include_reflective_questions']
        )
        next unless pdf_url

        download_report(pdf_url, user_plan, lang)
        job_record.increment_completed_tasks!
      end
    end

    def download_report(pdf_url, user_plan, locale)
      url = URI(pdf_url)
      IO.copy_stream(URI(url.to_s).open, download_path(user_plan, locale))
      # rescue OpenURI::HTTPError
      #   Rails.logger.error "Download failed for UserReport with id #{user_plan.id} and locale #{locale}"
      #   false
    end

    def download_path(user_plan, locale)
      user = user_plan.user

      dir = bulk_report.input_dir
      filename = "#{user.email}_#{Time.zone.today.strftime('%F')}_lang-#{locale}.pdf"
      FileUtils.mkdir_p(dir)
      File.join(dir, filename)
    end

    def user_idp_plans_with_pdf
      @user_idp_plans_with_pdf ||= user_idp_plans.
                                   includes(idp_report_pdfs: { pdf_file_attachment: :blob })
    end
  end
end
