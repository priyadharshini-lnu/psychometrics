# frozen_string_literal: true

module Hogan
  class FetchResultsJob < ApplicationJob
    queue_as :external_results

    def perform(users_campaigns_assessment, credentials, project)
      users_campaigns_assessment.assessment.reports.select(&:hogan?).each do |report|
        Hogan::FetchResults.call!(users_campaigns_assessment, report, credentials, project)
      end
    end
  end
end
