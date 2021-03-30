# frozen_string_literal: true

module UsersResults
  class SaveAgileScoringJob < ApplicationJob
    def perform(user_result, current_user)
      user_result.update!(
        scoring: ::UsersResults::CalculateAgileScoring.call!(user_result, current_user)
      )
      UsersResults::GenerateReports.call(user_result, current_user)
    end
  end
end
