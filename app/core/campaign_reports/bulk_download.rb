# frozen_string_literal: true

module CampaignReports
  class BulkDownload < BaseCommand
    include Rails.application.routes.url_helpers

    private_attr_reader :user_reports, :campaign_reports, :current_user, :bulk_report, :job_record

    def initialize(current_user:, job_record:, user_reports: nil, campaign_reports: nil)
      @user_reports = user_reports
      @campaign_reports = campaign_reports
      @current_user = current_user
      @job_record = job_record
      @bulk_report = ::BulkReport.create(user: current_user)
    end

    def call
      unless user_reports_with_pdf.exists?
        return broadcast :ok, { error_messages: [I18n.t('administration.bulk_reports.reports_unavailable')] }
      end

      if Settings.features.zip_s3_files_lambda
        bulk_download_with_lambda
        broadcast :waiting
      else
        bulk_download_without_lambda
        broadcast :ok, bulk_report
      end
    end

    private

    def bulk_download_with_lambda
      file_details = user_reports_with_pdf.preload_pdf_attachments.each_with_object([]) do |ur, acc|
        effective_locales = job_record.data['locales'] || [ur.effective_default_language]
        effective_locales.each do |locale|
          pdf_path = ur.pdf_path(locale: locale)
          pdf_path && (acc << {
            s3FilePath: pdf_path,
            zipOutputFilePath: "#{ur.user.email}/#{ur.report.name.parameterize(preserve_case: true)}-#{ur.campaign_id}-lan-#{locale}.pdf" # rubocop:disable Layout/LineLength
          })
        end
      end
      file_name = "bulk-report-#{Time.zone.today.strftime('%F')}"
      webhook_message = { bulk_report_id: bulk_report.id, file_name: file_name, admin_job_record_id: job_record.id }
      job_record.update!(total_tasks: file_details.length)
      Lambdas::ZipS3Files.call!(
        file_details: file_details,
        zip_file_key: bulk_report.attachment_storage_path('files', "#{file_name}.zip"),
        webhook_message: webhook_message
      )
    end

    def bulk_download_without_lambda
      create_input_directory
      download_user_reports_from_s3

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

    def download_user_reports_from_s3
      user_reports_with_pdf.preload_pdf_attachments.each do |user_report|
        effective_locales = job_record.data['locales'] || [user_report.effective_default_language]
        effective_locales.each do |locale|
          pdf_url = user_report.pdf_url(locale: locale)
          next unless pdf_url

          download_report(pdf_url, user_report, locale)
          job_record.increment_completed_tasks!
        end
      end
    end

    def download_report(pdf_url, user_report, locale)
      url = URI(pdf_url)
      IO.copy_stream(URI(url.to_s).open, download_path(user_report, locale))
    rescue OpenURI::HTTPError
      Rails.logger.error "Download failed for UserReport with id #{user_report.id} and locale #{locale}"
    end

    def download_path(user_report, locale)
      user = user_report.user
      report = user_report.report

      dir = bulk_report.input_dir
      dir = File.join(dir, user.email)
      filename = "#{user.email}_" \
                 "#{report.decorate.display_name.parameterize}_" \
                 "#{Time.zone.today.strftime('%F')}_lan-#{locale}.pdf"
      FileUtils.mkdir_p(dir)
      File.join(dir, filename)
    end

    def user_reports_with_pdf
      if job_record.data['is_threesixty'] || user_reports.present?
        subject_evaluator_counters = ::Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!(
          user_reports.pluck(:user_id),
          threesixty_campaign
        )
        user_report_ids = user_reports.includes(:subject).select do |user_report|
          (user_report.subject&.evaluation_status == 'completed') &&
            Threesixty::Subjects::IsReportAvailable.call!(
              user_report.subject,
              threesixty_campaign.option,
              subject_evaluator_counters.dig(user_report.user_id, :completed) || {},
              job_record.data['is_bulk_action']
            )
        end.map(&:id)

        UserReport.with_pdf_attachments.
          includes(:user, :report).
          where(id: user_report_ids).
          where(user_report_pdfs: { locale: job_record.data['locales'] })
      else
        start_date = job_record.data['start_date']
        end_date = job_record.data['end_date']
        include_inactive_users = job_record.data['include_inactive_users'] || false

        user_report_ids = ::Reports::BulkDownloadsQuery.new(
          campaign_reports,
          {
            start_date: start_date,
            end_date: end_date,
            include_inactive_users: include_inactive_users
          }
        ).query.pluck(:id)
        UserReport.
          includes(:user, :report).
          where(id: user_report_ids)
      end
    end

    def threesixty_campaign
      @threesixty_campaign ||= ::Threesixty::Campaign.find_by(campaign_id: job_record.data['campaign_id'])
    end
  end
end
