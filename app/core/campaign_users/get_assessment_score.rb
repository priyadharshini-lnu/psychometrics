# frozen_string_literal: true

module CampaignUsers
  class GetAssessmentScore < BaseCommand
    attr_accessor :campaign, :user, :score_source, :user_assessments

    def initialize(campaign, user, score_source = [])
      @campaign = campaign
      @user = user
      @score_source = score_source
      @user_assessments = campaign.user_assessments.includes(:users_result).where(
        subject_id: user.id,
        evaluator_id: user.id
      ).completed.index_by(&:assessment_id)
    end

    def call
      scores = score_source.each.with_object({}) do |source, score|
        score[{
          assessment_id: source.assessment_id,
          factor_id: source.factor_id,
          assessment_score_type: source.assessment_score_type
        }] = assessment_factor_score(source.assessment_id, source.factor_id, source.assessment_score_type)
      end
      broadcast :ok, scores
    end

    def assessment_factor_score(assessment_id, factor_id, score_type)
      users_result = user_assessments[assessment_id.to_i]&.users_result
      return nil unless users_result

      users_result.scoring&.dig(factor_id.to_i.to_s, score_type)
    end
  end
end
