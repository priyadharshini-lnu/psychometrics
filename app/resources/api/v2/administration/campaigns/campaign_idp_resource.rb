# frozen_string_literal: true

class Api::V2::Administration::Campaigns::CampaignIdpResource < Api::V2::Administration::BaseResource
  attributes :automatically_assign_new, :override_exists

  has_one :idp_template
  has_one :campaign

  def fetchable_fields
    super - %i[override_exists]
  end

  def override_exists=(_); end

  def self.records(opts)
    Api::Administration::Campaigns::CampaignIdpPolicy::Scope.new(
      opts[:context][:current_user], CampaignIdp, campaign_id: opts[:context][:campaign].id
    ).resolve
  end
end
