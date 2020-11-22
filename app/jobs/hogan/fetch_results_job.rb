# frozen_string_literal: true

module Hogan
  class FetchResultsJob < ApplicationJob
    queue_as :external_results

    def perform(user_result, credentials, project)
      user_result.hogan_user_reports.each do |user_report|
        Hogan::FetchResults.call!(user_result.user_assessment, user_report.report, credentials, project)
      end
    end
  end
end
