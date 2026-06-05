# frozen_string_literal: true

class CampaignFactorGroup < ApplicationRecord
  audited

  belongs_to :campaign
  include Tenantable

  has_many :campaign_factors, dependent: :destroy

  DEFAULT_GROUP_NAME = 'Assessment Center'

  before_create :set_position

  def set_position
    self.position = (campaign.campaign_factor_groups.maximum('position') || 0) + 1 unless position
  end
end
