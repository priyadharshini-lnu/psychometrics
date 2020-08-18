# frozen_string_literal: true

module Hogan
  # deprecated
  class LoadResultsJob < ApplicationJob
    queue_as :external_results
    retry_on StandardError, wait: ->(executions) { executions * 1.minutes }, attempts: 3

    def perform(assign, membership_with_result, project)
      assign.original_or_self.reports.select(&:hogan?).each do |report|
        Hogan::LoadResults.call(assign, report, membership_with_result, project) do
          on(:not_completed) { raise StandardError, "Hogan report not generated yet for assign with id#{assign.id}" }
        end
      end
    end
  end
end
