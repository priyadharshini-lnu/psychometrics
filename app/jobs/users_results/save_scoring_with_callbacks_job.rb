# frozen_string_literal: true

module UsersResults
  class SaveScoringWithCallbacksJob < ApplicationJob
    def perform(user_result, current_user)
      UserAssessments::SaveScoresWithCallbacks.call!(user_result.user_assessment, current_user)
    end
  end
end
