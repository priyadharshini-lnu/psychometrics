# frozen_string_literal: true

class IihtAssessmentSetting < ApplicationRecord
  belongs_to :assessment

  validates :iiht_assessment_name, presence: true
end
