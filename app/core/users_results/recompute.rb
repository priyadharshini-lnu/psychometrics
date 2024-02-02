# frozen_string_literal: true

module UsersResults
  class Recompute < BaseCommand
    private_attr_reader :user_result, :user_assessment, :current_user

    def initialize(user_result, current_user)
      @user_result = user_result
      @user_assessment = user_result.user_assessment
      @current_user = current_user
    end

    def call
      return broadcast :ok, user_result unless user_assessment.completed?
      return broadcast :ok, recompute_saville_assessment if user_assessment.saville?
      return broadcast :ok, recompute_pearson_assessment if user_assessment.pearson?

      if user_result.assessment.agile?
        compute_agile_assessment_scoring
      else
        compute_common_assessment_scoring
      end

      broadcast :ok, user_result
    end

    private

    def recompute_saville_assessment
      Saville::AssessmentOrderRequest.call!(user_assessment)
    end

    def recompute_pearson_assessment
      Pearson::SaveScoresAndReports.call!(user_assessment)
    end

    def compute_common_assessment_scoring
      user_result.answers = ::UsersResults::ExpandAnswersByRecoding.call!(user_result)
      user_result.scoring = ::UsersResults::CalculateScoring.call!(user_result) if user_result.completed?
      user_result.occupations = Assigns::CalculateOccupations.call!(user_result)
      user_result.innovation_styles = Assigns::CalculateInnovationStyles.call!(user_result)
      user_result.save!
    end

    def compute_agile_assessment_scoring
      user_result.update!(
        scoring: ::UsersResults::CalculateAgileScoring.call!(user_result)
      )
    end
  end
end
