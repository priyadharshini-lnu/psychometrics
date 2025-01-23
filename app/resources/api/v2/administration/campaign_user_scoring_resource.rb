# frozen_string_literal: true

class Api::V2::Administration::CampaignUserScoringResource < Api::V2::Administration::BaseResource
  attributes :campaign_scores_finalized, :campaign_scores_finalized_date, :campaign_scores_calculated_date,
             :campaign_scores_errors

  has_one :user
  has_many :campaign_factor_values

  ransack_filters %i[search_query campaign_users_active_in]

  def self.records(opts = {})
    Api::Administration::CampaignUserScoringPolicy::Scope.new(
      opts[:context][:user], CampaignUser,
      campaign_id: opts[:context][:campaign].id
    ).resolve
  end

  def self.sortable_fields(context)
    campaign = context[:campaign]
    campaign_factor_ids = campaign.campaign_factors.pluck(:id).map { |id| :"#{id}" }
    ranked_exists = campaign.campaign_factors.exists?(ranked: true)
    stack_rank = ranked_exists ? %i[stack_rank] : []
    super(context) + %i[email] + campaign_factor_ids + stack_rank
  end
end
