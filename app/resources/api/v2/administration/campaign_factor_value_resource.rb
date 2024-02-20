# frozen_string_literal: true

class Api::V2::Administration::CampaignFactorValueResource < Api::V2::Administration::BaseResource
  attributes :numeric_value, :string_value, :campaign_factor_id, :value

  has_one :campaign
  has_one :user
  has_one :campaign_factor

  ransack_filters %i[user_id_eq]

  def self.records(opts = {})
    ::Api::Administration::CampaignFactorValuePolicy::Scope.new(
      opts[:context][:user], CampaignFactorValue, campaign_id: opts[:context][:campaign].id
    ).resolve
  end
end
