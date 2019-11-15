# frozen_string_literal: true

class ChangeHbriForm < ActiveRecord::Migration[5.1]
  def change
    HoganAssessmentSetting.where(hogan_assessment_id: 'HBRIV1').update(hogan_form_id: 2)
  end
end
