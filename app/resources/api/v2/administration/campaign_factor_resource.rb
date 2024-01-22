# frozen_string_literal: true

class Api::V2::Administration::CampaignFactorResource < Api::V2::Administration::BaseResource
  attributes :name, :code, :position, :campaign_factor_group_id, :factor_type, :public_visibility, :description,
             :formula, :factor_id, :description, :output_type, :assessment_id, :assessment_score_type

  has_one :campaign
  has_one :campaign_factor_group, foreign_key_on: :related

  ransack_filters %i[factor_type_eq]

  def self.records(opts = {})
    ::Pundit.policy_scope!(opts[:context][:user], [:api, :administration, CampaignFactor]).where(
      campaign_id: opts[:context][:campaign].id
    ).order(:position)
  end
end
