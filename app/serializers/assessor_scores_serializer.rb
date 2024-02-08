# frozen_string_literal: true

class AssessorScoresSerializer < Panko::Serializer
  attributes :id, :evaluator, :assessment, :scores

  def id
    object.id.to_s
  end

  def evaluator
    {
      id: object.evaluator.id.to_s,
      first_name: object.evaluator.first_name,
      last_name: object.evaluator.last_name,
      email: object.evaluator.email
    }
  end

  def assessment
    {
      id: object.assessment.id.to_s,
      name: object.assessment.name
    }
  end

  def scores
    campaign_factors = campaign.campaign_factors.assessor_scoring
    score = object.users_result.scoring

    campaign_factors.map.with_object({}) do |campaign_factor, scores|
      next unless campaign_factor.factor_id

      scores[campaign_factor.factor_id] = score&.dig(campaign_factor.factor_id.to_s, 'score')
    end
  end

  def campaign
    context[:campaign]
  end
end
