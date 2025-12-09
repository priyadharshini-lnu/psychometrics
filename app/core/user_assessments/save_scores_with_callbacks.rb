# frozen_string_literal: true

module UserAssessments
  class SaveScoresWithCallbacks < BaseCommand
    attr_reader :user_assessment, :user_result, :current_user

    def initialize(user_assessment, current_user)
      @user_assessment = user_assessment
      @user_result = user_assessment.users_result
      @current_user = current_user
    end

    def call
      return unless user_result.completed?

      UserAssessments::SaveScores.call(user_assessment)

      ::UsersResults::GenerateReports.call!(user_result, current_user)
      webhook = UserAssessments::Webhook.new(user_assessment)
      webhook.publish_assessment_completed
      webhook.publish_assessment_raw_response
      webhook.publish_results_available
    end
  end
end
