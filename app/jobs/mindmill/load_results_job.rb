# frozen_string_literal: true

module Mindmill
  class LoadResultsJob < ApplicationJob
    queue_as :external_results
    retry_on StandardError, wait: ->(executions) { executions * 2.minutes }, attempts: 3

    def perform(user_result, current_user)
      data = ::Mindmill::GetResults.call!(user_result)

      raise StandardError, 'Unable to fetch mindmill report' unless data[:results] && data[:report]

      normalised_scores = Imports::External::MindmillImport.build(:mindmill).
                          process(data[:results], user_result)
      report = "data:application/pdf;base64,#{data[:report]}"

      user_result.user_reports(:mindmill).map { |ur| ur.update(pdf: report, status: :prepared) }
      user_result.update(external_results: normalised_scores)
      user_result.user_assessment.update(status: :completed, completed_at: Time.current)

      mindmill_user_report_ids = user_result.user_reports(:mindmill).pluck(:id)
      UsersResults::GenerateReports.call!(user_result, current_user, exceptUserReportIds: mindmill_user_report_ids)
    end
  end
end
