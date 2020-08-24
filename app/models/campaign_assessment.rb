# frozen_string_literal: true

class CampaignAssessment < ApplicationRecord
  belongs_to :campaign
  belongs_to :assessment
  belongs_to :norm

  def expired?
    Time.now > key_expires_at.to_i
  end

  def has_valid_universal_link?
    !assessment_key.blank? && !expired?
  end
end
