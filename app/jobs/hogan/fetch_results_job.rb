# frozen_string_literal: true

module Hogan
  class FetchResultsJob < ApplicationJob
    queue_as :external_results

    def perform(user_assessment, credentials, project)
      user_assessment.users_result.hogan_user_reports.each do |user_report|
        Hogan::FetchResults.call!(user_assessment, user_report.report, credentials, project)
      end
    end
  end
end
