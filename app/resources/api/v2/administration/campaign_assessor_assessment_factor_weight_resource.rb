# frozen_string_literal: true

class Api::V2::Administration::CampaignAssessorAssessmentFactorWeightResource < Api::V2::Administration::BaseResource
  attributes :id, :weight

  has_one :assessment
  has_one :factor

  def self.records(opts = {})
    ::Pundit.policy_scope!(opts[:context][:user], [:api, :administration, CampaignAssessorAssessmentFactorWeight]).
      where(campaign_id: opts[:context][:params]['campaign_id'])
  end
end
