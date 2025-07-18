# frozen_string_literal: true

module Skillvue
  class SaveScoresAndReportJob < ApplicationJob
    queue_as :external_results

    def perform(user_assessment, retry_count: 0)
      return if retry_count > 5

      Skillvue::SaveScoresAndReport.call!(user_assessment, retry_count: retry_count)
    end
  end
end
