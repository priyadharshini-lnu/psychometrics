# frozen_string_literal: true

class CampaignAssessment < ApplicationRecord
  belongs_to :campaign
  belongs_to :assessment
  belongs_to :norm
  belongs_to :assessor_form, class_name: 'Assessment'

  scope :ungrouped, -> { where(campaign_assessment_group_id: nil) }

  before_create :set_position

  delegate :common?, :hogan?, :mindmill?, :external?, :saville?, to: :assessment

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

  def norm_name
    return saville_norm_name if assessment.saville?

    norm&.name
  end

  def update_norm!(norm_id)
    return update!(saville_norm_id: norm_id) if assessment.saville?

    update!(norm_id: norm_id)
  end

  def user_assessments
    UserAssessment.where(campaign_id: campaign_id, assessment_id: assessment_id)
  end

  private

  def saville_norm_name
    Settings.providers.saville.norms.find { |norm| norm[:id] == saville_norm_id }&.dig(:name)
  end
end
