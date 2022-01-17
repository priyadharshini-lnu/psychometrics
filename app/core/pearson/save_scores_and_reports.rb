# frozen_string_literal: true

module Pearson
  class SaveScoresAndReports < Base
    private_attr_reader :user_assessment

    def initialize(user_assessment)
      @user_assessment = user_assessment
    end

    def call
      schedule_id = user_assessment.pearson_user_assessment.schedule_id
      response = client.get("v1/results/#{schedule_id}")
      scores_and_report = ::JSON.parse(response.body).dig('data', 'candidates', 0, 'products', 0, 'results')

      scores = scores_and_report.dig('scores', 'items')
      report_item = scores_and_report.dig('reports', 'items', 0)

      raise StandardError, 'Pearson assessment scores not available' if scores.blank? || report_item.blank?

      user_result = user_assessment.users_result
      user_result.update(external_results: scores)
      user_assessment.update!(status: :completed, completed_at: Time.current) unless user_assessment.completed?
      generate_internal_reports

      if report_item && report_item['type'] == 'pdf'
        user_assessment.
          external_user_reports(:pearson).
          first&.
          update(remote_pdf_url: report_item['url'], status: :prepared)
      end

      broadcast :ok
    end

    private

    def generate_internal_reports
      ::UsersResults::GenerateReports.call(
        user_assessment.users_result,
        user_assessment.user,
        exceptUserReportIds: user_assessment.external_user_reports(:pearson).pluck(:id)
      )
    end
  end
end
