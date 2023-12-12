# frozen_string_literal: true

class Api::V2::Administration::CampaignFactorGroupResource < Api::V2::Administration::BaseResource
  attributes :name, :position

  has_one :campaign
  has_many :campaign_factors

  before_remove do
    if @model.campaign.campaign_factor_groups.count <= 1
      @model.errors.add(:base, I18n.t('dry_errors.errors.campaign_factor_group.last_factor_group'))
      raise JSONAPI::Exceptions::ValidationErrors, self
    end
  end

  def self.records(opts = {})
    ::Pundit.policy_scope!(opts[:context][:user], [:api, :administration, CampaignFactorGroup]).where(
      campaign_id: opts[:context][:campaign].id
    ).order(:position)
  end
end
