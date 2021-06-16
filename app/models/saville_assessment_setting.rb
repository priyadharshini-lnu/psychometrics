# frozen_string_literal: true

class SavilleAssessmentSetting < ApplicationRecord
  belongs_to :assessment

  validates :saville_assessment_id, presence: true

  before_save :downcase_saville_assessment_and_norm_id
  before_create :add_saville_norm_id

  def downcase_saville_assessment_and_norm_id
    self.saville_assessment_id = saville_assessment_id&.downcase
    self.saville_norm_id = saville_norm_id&.downcase
  end

  def add_saville_norm_id
    self.saville_norm_id = default_saville_norm_id
  end

  def default_saville_norm_id
    assessment_setting.default_norm_id
  end

  def saville_norms
    Settings.providers.saville.norms.select { |norm| assessment_setting.norm_ids.include?(norm[:id]) }.map(&:to_h)
  end

  private

  def assessment_setting
    Settings.providers.saville.assessments.find { |a| a.id.downcase == saville_assessment_id }
  end
end
