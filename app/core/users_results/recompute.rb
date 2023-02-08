# frozen_string_literal: true

module UsersResults
  class Recompute < BaseCommand
    private_attr_reader :user_result, :user_assessment, :current_user, :norm_id, :fixed_norm, :nullifly_norm

    def initialize(user_result, current_user, options = {})
      @user_result = user_result
      @user_assessment = user_result.user_assessment
      @current_user = current_user
      @norm_id = options[:norm_id]
      @nullifly_norm = options[:nullifly_norm]
      @fixed_norm = options[:fixed_norm] == true
    end

    def call
      return broadcast :ok, recompute_saville_assessment if user_assessment.saville?
      return broadcast :ok, recompute_pearson_assessment if user_assessment.pearson?

      user_assessment.update!(norm_id: norm_id, fixed_norm: fixed_norm) if norm_id || nullifly_norm
      return broadcast :ok, user_result unless user_assessment.completed?

      if user_result.assessment.agile?
        compute_agile_assessment_scoring
      else
        compute_common_assessment_scoring
      end

      broadcast :ok, user_result
    end

    private

    def recompute_saville_assessment
      if norm_id
        user_assessment.saville_user_assessment.update!(norm_id: norm_id)
        user_assessment.update!(fixed_norm: fixed_norm)
      end
      Saville::AssessmentOrderRequest.call!(user_assessment) unless user_assessment.not_started?
    end

    def recompute_pearson_assessment
      set_pearson_norm
      Pearson::SaveScoresAndReports.call!(user_assessment) if user_assessment.completed?
    end

    def set_pearson_norm
      if norm_id && user_assessment.not_started?
        user_assessment.pearson_user_assessment.update!(norm_id: norm_id)
        user_assessment.update!(fixed_norm: fixed_norm)
      end
    end

    def compute_common_assessment_scoring
      user_result.answers = ::UsersResults::ExpandAnswersByRecoding.call!(user_result)
      user_result.scoring = ::UsersResults::CalculateScoring.call!(user_result, norm_data) if user_result.completed?
      user_result.occupations = Assigns::CalculateOccupations.call!(user_result)
      user_result.innovation_styles = Assigns::CalculateInnovationStyles.call!(user_result)
      user_result.save!
    end

    def compute_agile_assessment_scoring
      user_result.update!(
        scoring: ::UsersResults::CalculateAgileScoring.call!(user_result)
      )
    end

    def norm_data
      {
        'id' => norm_id || user_assessment.norm_id
      }
    end
  end
end
