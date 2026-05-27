# frozen_string_literal: true

module CampaignFactors
  class CalculateAssessorScoringFactor < BaseCommand
    private_attr_reader :campaign, :user

    def initialize(campaign, user)
      @campaign = campaign
      @user = user
    end

    def call
      # Auto-moderation happens in two scenarios:
      # 1. When there's no lead assessor (original behavior)
      # 2. When there IS a lead assessor BUT the factor has disallow_lead_assessor_moderation enabled
      return broadcast :ok, {} if lead_assessor.present? && !has_auto_moderated_factors?

      factor_values = {}

      factors_to_calculate = if lead_assessor.present?
                               # If lead assessor exists, only auto-moderate factors with the flag enabled
                               campaign.campaign_factors.assessor_scoring.auto_moderated
                             else
                               # If no lead assessor, auto-moderate all assessor_scoring factors
                               campaign.campaign_factors.assessor_scoring
                             end

      factors_to_calculate.each do |campaign_factor|
        next unless can_calculate_assessor_scoring_factor?(campaign_factor)

        computed_campaign_factor_value = calculate_factor_scores(campaign_factor)
        factor_values[campaign_factor] = CampaignScoring::FactorValue.new(computed_campaign_factor_value)
      end

      broadcast :ok, factor_values
    end

    private

    def has_auto_moderated_factors?
      campaign.campaign_factors.assessor_scoring.auto_moderated.exists?
    end

    def calculate_factor_scores(campaign_factor)
      assessor_scores = assessor_user_assessments(campaign_factor).each_with_object([]) do |assessor_ua, scores|
        factor_scoring = assessor_ua.users_result.scoring[campaign_factor.factor_id.to_s]
        factor_score = factor_scoring&.dig(campaign_factor.assessment_score_type)

        weight = factor_weight(assessor_ua.assessment_id, campaign_factor.factor_id)&.weight || 1.0

        scores << (factor_score * weight) if factor_score
      end

      if assessor_scores.any?
        (assessor_scores.sum / assessor_scores.size).round(2)
      end
    end

    def can_calculate_assessor_scoring_factor?(campaign_factor)
      CampaignFactors::CanCalculateAssessorScoringFactor.call!(campaign_factor, user)
    end

    def assessor_user_assessments(campaign_factor)
      @assessor_user_assessments = GetUserAssessmentForAssessorScoring.new(campaign_factor, user).query
    end

    def factor_weight(assessment_id, factor_id)
      assessor_assessment_factor_weights.find do |weight|
        weight.assessment_id == assessment_id && weight.factor_id == factor_id
      end
    end

    def assessor_assessment_factor_weights
      @assessor_assessment_factor_weights ||= campaign.campaign_assessor_assessment_factor_weights
    end

    def lead_assessor
      @lead_assessor ||= Users::GetLeadAssessor.call!(campaign, user)
    end
  end
end
