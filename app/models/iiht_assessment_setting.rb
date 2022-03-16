# frozen_string_literal: true

class IihtAssessmentSetting < ApplicationRecord
  belongs_to :assessment

  validates :iiht_assessment_id_number, presence: true
  validate :validate_iiht_schedule_config

  before_save :parse_iiht_schedule_config

  def validate_iiht_schedule_config
    return unless iiht_schedule_config.presence.is_a?(String)

    JSON.parse(iiht_schedule_config)
  rescue JSON::ParserError
    errors.add(:iiht_schedule_config, :invalid)
  end

  def parse_iiht_schedule_config
    self.iiht_schedule_config = iiht_schedule_config.presence.is_a?(String) ? JSON.parse(iiht_schedule_config) : nil
  end
end
