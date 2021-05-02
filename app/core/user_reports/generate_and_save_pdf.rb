# frozen_string_literal: true

module UserReports
  class GenerateAndSavePdf < BaseCommand
    private_attr_reader :current_user, :job_record, :campaign, :report, :user, :user_reports, :options

    def initialize(user_reports, current_user, options = {}, job_record = nil)
      @user_reports = Array.wrap(user_reports)
      @current_user = current_user
      @job_record = job_record
      @options = options
    end

    def call
      progress = 0
      user_reports.each do |user_report|
        progress += 100 / user_reports.size
        unless user_report.generatable?
          AdminJob.update_progress(job_record, progress) if job_record
          next
        end

        user_report.update(status: :generating)

        report = user_report.report

        generate_mindminl_report(user_report) if report.mindmill?
        generate_hogan_report(user_report) if report.hogan?
        generate_internal_report(user_report) if report.provider_internal?
        AdminJob.update_progress(job_record, progress) if job_record
      end

      broadcast :ok
    end

    def generate_internal_report(user_report)
      pdf_file_path = UserReports::GeneratePdf.call!(user_report, current_user, options)

      File.open(pdf_file_path) { |file| user_report.update!(status: :prepared, pdf: file) }
      publish_to_webhook(user_report)
    end

    def generate_mindminl_report(user_report)
      Mindmill::LoadResultsJob.perform_later(user_report.user_results.first, current_user)
    end

    def generate_hogan_report(user_report)
      Hogan::FetchResultsJob.perform_later(
        user_report.user_results.first,
        user_report.user.hogan_credential,
        user_report.project
      )
    end

    def publish_to_webhook(user_report)
      user_result = user_report.user_results.first
      campaign = user_result.user_assessment.campaign

      data = {
        campaign: campaign,
        subject: user_result.subject,
        report: user_report.report,
        user_report: user_report
      }
      WebhookSubscriptions::Publish.call!(campaign.project, :report_available, data)
    end
  end
end
