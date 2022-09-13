# frozen_string_literal: true

module Hogan
  class FetchResultsJob < ApplicationJob
    queue_as :external_results
    retry_on StandardError, wait: ->(executions) { executions * 2.minutes }, attempts: 3

    def perform(user_result, credentials, project)
      all_report_pdf_available = user_result.external_user_reports(:hogan).all?(&:pdf?)
      return if user_result.external_results.present? && all_report_pdf_available

      Hogan::FetchResults.call(user_result, credentials, project) do
        on(:not_completed) { raise StandardError, 'Unable to fetch hogan report' }
        on(:failed_to_add_report_in_hogan) { raise StandardError, 'Failed to add report in hogan' }
      end
    end
  end
end
