# frozen_string_literal: true

class Api::V2::Administration::CampaignFactorValueResource < Api::V2::Administration::BaseResource
  attributes :int_value, :string_value

  def self.records(opts = {})
    ::Pundit.policy_scope!(opts[:context][:user], [:api, :administration, CampaignFactorValue]).where(
      campaign_id: opts[:context][:campaign].id
    )
  end
end
