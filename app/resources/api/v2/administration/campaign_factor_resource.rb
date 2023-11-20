# frozen_string_literal: true

class Api::V2::Administration::CampaignFactorResource < Api::V2::Administration::BaseResource
  attributes :name, :code, :position

  def self.records(opts = {})
    ::Pundit.policy_scope!(opts[:context][:user], [:api, :administration, CampaignFactor]).where(
      campaign_id: opts[:context][:campaign].id
    )
  end
end
