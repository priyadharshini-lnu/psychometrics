# frozen_string_literal: true

module UserReports
  class PrepareUserReportData < BaseCommand
    private_attr_reader :user_report, :report

    def initialize(user_report)
      @user_report = user_report
      @report = @user_report.report
    end

    def call
      data = ::Reports::BuildResults.
             call!(report, report_user_results).
             map { |item| { key: item.dig(:config_data, 'id') || item[:key], value: item[:value] } }
      broadcast :ok, data
    end

    private

    def report_user_results
      user_report.user_results.includes(:user_assessment).
        filter { |ur| report.data_configuration_assessment_ids.include?(ur.user_assessment.assessment_id) }
    end
  end
end
