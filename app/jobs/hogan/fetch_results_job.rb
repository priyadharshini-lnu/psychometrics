# frozen_string_literal: true

module Hogan
  class FetchResultsJob < ApplicationJob
    queue_as :external_results
    retry_on StandardError, wait: ->(executions) { executions * 2.minutes }, attempts: 3

    def perform(user_result, credentials, project)
      Hogan::FetchResults.call(user_result, credentials, project) do
        on(:not_completed) { raise StandardError, 'Unable to fetch hogan report' }
      end
    end
  end
end
