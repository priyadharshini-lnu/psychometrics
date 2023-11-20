# frozen_string_literal: true

class Api::V2::Administration::CampaignFactorGroupResource < Api::V2::Administration::BaseResource
  attributes :name, :position

  def self.records(opts = {})
    ::Pundit.policy_scope!(opts[:context][:user], [:api, :administration, CampaignFactorGroup]).where(
      campaign_id: opts[:context][:campaign].id
    )
  end
end
