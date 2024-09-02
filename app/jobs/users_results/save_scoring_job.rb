# frozen_string_literal: true

module UsersResults
  class SaveScoringJob < ApplicationJob
    def perform(user_result)
      UserAssessments::SaveScores.call!(user_result.user_assessment)
    end
  end
end
