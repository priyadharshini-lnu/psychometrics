# frozen_string_literal: true

module Hogan
  class SaveReportsAndScoresJob < ApplicationJob
    queue_as :external_results

    def perform(user_reports, retry_count: 0)
      return if retry_count > 5

      Hogan::SaveReportsAndScores.call!(user_reports, retry_count: retry_count)
    end
  end
end
