# frozen_string_literal: true

class Api::V2::Administration::CampaignUserScoringResource < Api::V2::Administration::BaseResource
  attributes :campaign_scores_finalized, :campaign_scores_finalized_date, :campaign_scores_calculated_date,
             :campaign_scores_errors

  has_one :user
  has_many :campaign_factor_values

  def self.records(opts = {})
    Api::Administration::CampaignUserScoringPolicy::Scope.new(
      opts[:context][:user], CampaignUser,
      campaign_id: opts[:context][:campaign].id
    ).resolve
  end
end
