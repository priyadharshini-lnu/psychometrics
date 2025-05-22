# frozen_string_literal: true

class Api::V2::Administration::CampaignUserResource < Api::V2::Administration::BaseResource
  attributes :active, :campaign_scores_finalized, :campaign_scores_finalized_date,
             :campaign_scores_calculated_date, :campaign_scores_errors, :campaign_factor_values

  has_one :user

  def campaign_factor_values
    all_factors = CampaignFactor.where(campaign_id: @model.campaign_id)
    factor_values = @model.campaign_factor_values.index_by(&:campaign_factor_id)

    all_factors.map do |factor|
      value = factor_values[factor.id]
      {
        campaign_factor_id: factor.id,
        value: value&.value,
        label: value&.label
      }
    end
  end
end
