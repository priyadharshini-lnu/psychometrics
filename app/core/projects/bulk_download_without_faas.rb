# frozen_string_literal: true

module Projects
  class BulkDownloadWithoutFaas
    include BulkDownloadHelpers

    def initialize(bulk_report:, job_record:)
      @bulk_report = bulk_report
      @job_record  = job_record
    end

    def call(campaign_groups)
      create_input_directory

      campaign_groups.each do |group|
        group[:file_entries].each do |entry|
          user_report = entry[:_user_report]
          locale      = entry[:_locale]

          pdf_url = user_report.pdf_url(locale: locale)
          next unless pdf_url

          download_report(pdf_url, user_report, locale)
          @job_record.increment_completed_tasks!
        end
      end

      ::BulkReports::CompressJob.perform_now(@bulk_report)
      BulkReportMailer.notify(@bulk_report).deliver_later
      FileUtils.rm_rf(@bulk_report.input_dir)
    end

    private

    def create_input_directory
      input_dir = @bulk_report.input_dir
      FileUtils.rm_rf(input_dir) if File.directory?(input_dir)
      FileUtils.mkdir_p(input_dir)
    end

    def download_report(pdf_url, user_report, locale)
      IO.copy_stream(URI(pdf_url.to_s).open, download_path(user_report, locale))
    rescue OpenURI::HTTPError
      Rails.logger.error(
        "Projects::BulkDownload: download failed for UserReport ##{user_report.id}, locale=#{locale}"
      )
    end

    def download_path(user_report, locale)
      dir = File.join(
        @bulk_report.input_dir,
        safe_folder_name(user_report.campaign.name),
        user_report.user.email
      )
      FileUtils.mkdir_p(dir)
      File.join(dir, "#{user_report.report.name.parameterize(preserve_case: true)}-lan-#{locale}.pdf")
    end
  end
end
