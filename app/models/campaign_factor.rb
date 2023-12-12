# frozen_string_literal: true

class CampaignFactor < ApplicationRecord
  belongs_to :campaign_factor_group
  belongs_to :campaign
  belongs_to :factor
  belongs_to :assessment

  has_many :campaign_factor_values, dependent: :destroy

  enum factor_type: { assessment: 0, datasheet: 1, assessor_scoring: 2, formula: 3 }
  enum output_type: { numeric: 0, string: 1 }

  before_create :set_position

  def set_position
    self.position = (
      campaign.campaign_factor_groups.
      where(id: campaign_factor_group_id).
      maximum('position') || 0) + 1
  end
end
