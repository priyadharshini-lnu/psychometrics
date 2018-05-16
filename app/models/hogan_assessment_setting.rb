class HoganAssessmentSetting < ApplicationRecord
  belongs_to :assessment

  validates :hogan_form_id, presence: true
  validates :hogan_assessment_id, presence: true
end
