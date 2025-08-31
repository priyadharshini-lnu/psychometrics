# frozen_string_literal: true

module UserAssessments
  class SaveScores < BaseCommand
    attr_reader :user_assessment, :user_result

    def initialize(user_assessment)
      @user_assessment = user_assessment
      @user_result = user_assessment.users_result
    end

    def call
      return unless user_result.completed?

      transaction do
        if user_result.assessment.agile?
          user_result.update!(
            scoring: ::UsersResults::CalculateAgileScoring.call!(user_result)
          )
        elsif user_assessment.external?
          user_result.update!(scoring: ::UsersResults::CalculateScoring.call!(user_result))
          user_assessment.generate_campaign_scoring_and_artifacts_results
        else
          user_result.answers = ::UsersResults::ExpandAnswersByRecoding.call!(user_result)
          user_result.scoring = ::UsersResults::CalculateScoring.call!(user_result) if user_result.completed?
          user_result.occupations = ::UsersResults::CalculateOccupations.call!(user_result)
          user_result.innovation_styles = ::UsersResults::CalculateInnovationStyles.call!(user_result)
          user_result.save!
        end

        user_assessment.update!(score_calculated: true, score_calculated_at: Time.zone.now)
      end
    end
  end
end
