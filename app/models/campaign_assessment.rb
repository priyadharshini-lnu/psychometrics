# frozen_string_literal: true

class CampaignAssessment < ApplicationRecord
  audited

  belongs_to :campaign
  belongs_to :assessment
  belongs_to :norm
  belongs_to :assessor_form, class_name: 'Assessment'
  belongs_to :campaign_assessment_group

  scope :ungrouped, -> { where(campaign_assessment_group_id: nil) }

  validate :validate_external_config
  before_save :parse_external_config

  before_create :set_position

  delegate :common?,
           :hogan?,
           :mindmill?,
           :external?,
           :saville?,
           :iiht?,
           :has_external_norm?,
           :external_assessment_id,
           to: :assessment

  scope :preworks, -> { where(prework: true) }
  scope :workshop_activities, -> { where(workshop_activity: true) }

  def validate_external_config
    return unless external_config.presence.is_a?(String)

    JSON.parse(external_config)
  rescue JSON::ParserError
    errors.add(:external_config, :invalid)
  end

  def parse_external_config
    self.external_config = external_config.presence.is_a?(String) ? JSON.parse(external_config) : nil
  end

  def expired?
    Time.zone.now > key_expires_at.to_i
  end

  def has_valid_universal_link?
    assessment_key.present? && !expired?
  end

  def set_position
    self.position = (campaign.
      campaign_assessments.
      where(campaign_assessment_group_id: campaign_assessment_group_id).
      maximum('position') || 0) + 1
  end

  def norm_name
    return pearson_norm_name if assessment.pearson?
    return saville_norm_name if assessment.saville?

    norm&.name
  end

  def update_norm!(norm_id)
    return update!(external_norm_id: norm_id) if has_external_norm?

    update!(norm_id: norm_id)
  end

  def user_assessments
    UserAssessment.where(campaign_id: campaign_id, assessment_id: assessment_id)
  end

  def log_attributes
    slice(:campaign_id, :assessment_id, :norm_id)
  end

  private

  def pearson_norm_name
    Assessments::PearsonSettings.
      norms(external_assessment_id)&.
      find { |norm| norm[:id] == external_norm_id }&.dig(:name)
  end

  def saville_norm_name
    Settings.providers.saville.norms.find { |norm| norm[:id] == external_norm_id }&.dig(:name)
  end
end
