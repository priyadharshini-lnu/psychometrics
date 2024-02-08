# frozen_string_literal: true

class Api::V2::Administration::CampaignUserResource < Api::V2::Administration::BaseResource
  attributes :id, :campaign_scores_finalized, :campaign_scores_finalized_date, :campaign_scores_calculated_date,
             :campaign_scores_errors

  has_one :user
  has_many :campaign_factor_values
end
