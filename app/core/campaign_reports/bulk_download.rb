# frozen_string_literal: true

module CampaignReports
  class BulkDownload < BaseCommand
    include Rails.application.routes.url_helpers

    private_attr_reader :campaign_reports, :current_user, :bulk_report, :job_record

    def initialize(campaign_reports, current_user, job_record)
      @campaign_reports = campaign_reports
      @current_user = current_user
      @job_record = job_record
      @bulk_report = ::BulkReport.create(user: current_user)
    end

    def call
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
      file_details = user_reports_with_pdf.each_with_object([]) do |ur, acc|
        acc << {
          s3FilePath: ur.pdf_file.key,
          zipOutputFilePath: "#{ur.user.email}/#{ur.report.name.parameterize(preserve_case: true)}-#{ur.campaign_id}.pdf" # rubocop:disable Layout/LineLength
        }
      end
      file_name = "bulk-report-#{Time.zone.today.strftime('%F')}"
      webhook_message = { bulk_report_id: bulk_report.id, file_name: file_name, admin_job_record_id: job_record.id }
      job_record.update!(total_tasks: file_details.length)
      Lambdas::ZipS3Files.call!(
        file_details: file_details,
        zip_file_key: file_name,
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
      job_record.update!(total_tasks: user_reports_with_pdf.length)
      user_reports_with_pdf.each do |user_report|
        download_report(user_report)
        job_record.increment_completed_tasks!
      end
    end

    def download_report(user_report)
      url = URI(user_report.pdf_file.url)
      IO.copy_stream(URI(url.to_s).open, download_path(user_report))
    rescue OpenURI::HTTPError
      Rails.logger.error "Download failed for UserReport with id #{user_report.id}"
    end

    def download_path(user_report)
      user = user_report.user
      report = user_report.report
      dir = bulk_report.input_dir
      dir = File.join(dir, user.email)
      filename = "#{user.email}_#{report.decorate.display_name.parameterize}_#{Time.zone.today.strftime('%F')}.pdf"

      FileUtils.mkdir_p(dir)
      File.join(dir, filename)
    end

    def user_reports_with_pdf
      UserReport.
        joins(:pdf_file_attachment).
        includes(:user, :report).
        where(
          report_id: campaign_reports.pluck(:report_id),
          campaign_id: campaign_reports.first.campaign_id
        )
    end
  end
end
