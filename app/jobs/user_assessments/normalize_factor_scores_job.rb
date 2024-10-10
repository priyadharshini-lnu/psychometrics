# frozen_string_literal: true

module UserAssessments
  class NormalizeFactorScoresJob < ApplicationJob
    def perform(user_assessment)
      UserAssessments::NormalizeFactorScores.call!(user_assessment)
    end
  end
end
