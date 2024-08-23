# frozen_string_literal: true

module Mettl
  class SaveScoresAndReport < Base
    private_attr_reader :user_assessment, :scores_and_report

    def initialize(user_assessment, scores_and_report = nil)
      @user_assessment = user_assessment
      @scores_and_report = scores_and_report
    end

    def call
      external_results = {
        meta_data: {
          start_time: parse_datetime(scores_and_report.dig('testStatus', 'startTime')),
          end_time: parse_datetime(scores_and_report.dig('testStatus', 'endTime')),
          overall_status: scores_and_report.dig('testStatus', 'overallStatus'),
          detailed_status: scores_and_report.dig('testStatus', 'detailedStatus')
        },
        scores: scores_and_report.dig('testStatus', 'result')
      }

      user_assessment.users_result.update(external_results: external_results)

      completed_at = parse_datetime(scores_and_report.dig('testStatus', 'endTime'))
      user_assessment.update(completed_at: completed_at) if completed_at

      generate_internal_reports

      pdf_report_url = scores_and_report.dig('testStatus', 'pdfReport')

      return broadcast :ok if pdf_report_url.blank?

      user_report = user_assessment.user_reports(:mettl).first
      return broadcast :ok unless user_report

      user_report.attach_pdf!(pdf_report_url, 'mettl-report.pdf') if pdf_report_url

      broadcast :ok
    end

    private

    def parse_datetime(datetime_str)
      datetime_str&.in_time_zone('UTC')
    end

    def generate_internal_reports
      ::UsersResults::GenerateReports.call(user_assessment.users_result, user_assessment.user)
    end

    def scores_and_report
      @scores_and_report ||= Mettl::GetScores.call!(user_assessment)
    end
  end
end
