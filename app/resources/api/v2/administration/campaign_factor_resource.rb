# frozen_string_literal: true

class Api::V2::Administration::CampaignFactorResource < Api::V2::Administration::BaseResource
  attributes :name, :code, :position, :campaign_factor_group_id, :factor_type, :public_visibility, :description,
             :formula, :factor_id, :assessment_id, :output_type, :assessment_score_type, :dimension_id, :ranked,
             :min_value, :max_value, :is_na_allowed, :disallow_lead_assessor_moderation

  has_one :campaign
  has_one :campaign_factor_group, foreign_key_on: :related
  has_one :assessment
  has_one :factor
  has_one :dimension

  ransack_filters %i[factor_type_eq]

  def assessment_id
    @model.assessment&.id.to_s
  end

  def factor_id
    @model.factor&.id.to_s
  end

  def dimension_id
    @model.factor&.dimension&.id.to_s
  end

  before_create do
    ranked = context[:params].dig(:data, :attributes, :ranked)
    campaign_id = context[:params]['campaign_id']
    if ranked
      CampaignFactor.where(campaign_id: campaign_id).update_all(ranked: false)
    end
  end

  before_update do
    output_type = context[:params].dig(:data, :attributes, :output_type)
    id = context[:params].dig(:data, :id)
    if output_type != 'numeric'
      @model.campaign.campaign_factors.where(id).update(ranked: false)
    end
    ranked = context[:params].dig(:data, :attributes, :ranked)
    if ranked
      @model.campaign.campaign_factors.where(ranked: true).update_all(ranked: false)
    end
  end

  def self.records(opts = {})
    ::Pundit.policy_scope!(opts[:context][:user], [:api, :administration, CampaignFactor]).
      where(campaign_id: opts[:context][:campaign].id).
      includes(:assessment, :factor).
      order(:position)
  end
end
