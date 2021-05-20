# frozen_string_literal: true

module UsersResults
  class SaveAgileScoringJob < ApplicationJob
    def perform(user_result, current_user)
      user_result.update!(
        scoring: ::UsersResults::CalculateAgileScoring.call!(user_result, current_user)
      )
      UsersResults::GenerateReports.call(user_result, current_user)
      webhook = UserAssessments::Webhook.new(user_result.user_assessment)
      webhook.publish_assessment_completed
      webhook.publish_results_available
    end
  end
end
