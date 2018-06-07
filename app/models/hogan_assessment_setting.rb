class HoganAssessmentSetting < ApplicationRecord
  belongs_to :assessment

  validates :hogan_form_id, presence: true
  validates :hogan_assessment_id, presence: true

  before_validation :set_hogan_form_id

  private

  def set_hogan_form_id
    setting = Settings.hogan.find { |i| i[:assessment_id] == self.hogan_assessment_id }
    self.hogan_form_id = setting.form_id
  end
end
