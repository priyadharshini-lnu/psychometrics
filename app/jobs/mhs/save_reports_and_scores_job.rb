# frozen_string_literal: true

module Mhs
  class SaveReportsAndScoresJob < ApplicationJob
    queue_as :external_results

    def perform(user_assessment, user_reports, retry_count: 0)
      return if retry_count > 5

      Mhs::SaveReportsAndScores.call!(user_assessment, user_reports, retry_count: retry_count)
    end
  end
end
