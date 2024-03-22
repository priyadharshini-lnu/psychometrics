# frozen_string_literal: true

module Idp
  class GetUserSkillScore < BaseCommand
    attr_accessor :user, :skill_template, :campaign_factor_values, :user_assessment_scores

    def initialize(user, skill_template, campaign_factor_values, user_assessment_scores)
      @user = user
      @skill_template = skill_template
      @campaign_factor_values = campaign_factor_values
      @user_assessment_scores = user_assessment_scores
    end

    def call
      score = campaign_factor_score if skill_template.scoring_source_campaign_factor?
      score = assessment_score if skill_template.scoring_source_assessment?
      broadcast :ok, score
    end

    def campaign_factor_score
      campaign_factor_values[skill_template.campaign_factor_code]
    end

    def assessment_score
      user_assessment_scores[
        {
          assessment_id: skill_template.assessment_id,
          factor_id: skill_template.factor_id,
          assessment_score_type: skill_template.assessment_score_type
        }
      ]
    end
  end
end
