# frozen_string_literal: true

class CampaignAssessment < ApplicationRecord
  belongs_to :campaign
  belongs_to :assessment
  belongs_to :norm

  before_create :set_position

  def expired?
    Time.now > key_expires_at.to_i
  end

  def has_valid_universal_link?
    !assessment_key.blank? && !expired?
  end

  def set_position
    self.position = (campaign.
      campaign_assessments.
      where(campaign_assessment_group_id: campaign_assessment_group_id).
      maximum('position') || 0) + 1
  end
end
