# frozen_string_literal: true

module DataReports::FieldHandlers
  class AssessmentScoreHandler < ::DataReports::BaseFieldHandler
    private_attr_reader :user_assessment

    def call
      @user_assessment = cu.user_assessments.includes(:users_result).
                         completed.find_by(assessment_id: field['assessment_id'])

      broadcast :ok, assessment_factor_score(field['factor_id'], field['score_type'])
    end

    private

    def norm_score
      assessment_factor_score(field['factor_id'], 'norm_score')
    end

    def zscore
      assessment_factor_score(field['factor_id'], 'zscore')
    end

    def score
      assessment_factor_score(field['factor_id'], 'score')
    end

    def percentage
      assessment_factor_score(field['factor_id'], 'percentage')
    end

    def assessment_factor_score(factor_id, score_type)
      users_result = user_assessment&.users_result
      return nil unless users_result

      users_result.scoring&.dig(factor_id.to_i.to_s, score_type)
    end
  end
end
