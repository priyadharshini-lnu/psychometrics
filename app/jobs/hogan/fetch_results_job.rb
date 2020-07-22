# frozen_string_literal: true

module Hogan
  class FetchResultsJob < ApplicationJob
    queue_as :external_results

    def perform(user_assessment, credentials, project)
      user_assessment.assessment.reports.select(&:hogan?).each do |report|
        Hogan::FetchResults.call!(user_assessment, report, credentials, project)
      end
    end
  end
end
