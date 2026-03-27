# frozen_string_literal: true

module Skillvue
  class SaveScoresAndReport < Base
    private_attr_reader :user_assessment, :retry_count

    def initialize(user_assessment, scores_and_report = nil, retry_count: 0)
      @user_assessment = user_assessment
      @scores_and_report = scores_and_report
      @retry_count = retry_count
    end

    def call
      return retry_save_scores if scores_and_report.blank?

      user_assessment.users_result.update(external_results: scores_and_report['payload'])

      completed_at = parse_datetime(scores_and_report['timestamp'])
      user_assessment.update(status: :completed, completed_at: completed_at) if completed_at

      generate_internal_reports

      pdf_report_url = scores_and_report['pdfUrl']

      return broadcast :ok if pdf_report_url.blank?

      user_report = user_assessment.user_reports(:skillvue).first
      return broadcast :ok unless user_report

      user_report.attach_pdf!(pdf_report_url, 'skillvue-report.pdf') if pdf_report_url

      broadcast :ok
    end

    private

    def parse_datetime(datetime_str)
      datetime_str&.in_time_zone('UTC')
    end

    def generate_internal_reports
      ::UsersResults::GenerateReports.call(
        user_assessment.users_result,
        user_assessment.user,
        exceptUserReportIds: user_assessment.user_reports(:skillvue).pluck(:id)
      )
    end

    def scores_and_report
      @scores_and_report ||= Skillvue::GetScoresAndReport.call!(user_assessment)
    end

    def retry_save_scores
      Skillvue::SaveScoresAndReportJob.
        set(wait: (2**retry_count).minute).
        perform_later(user_assessment, retry_count: retry_count + 1)
    end
  end
end
