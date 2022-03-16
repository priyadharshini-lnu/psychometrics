# frozen_string_literal: true

class RenameIihtAssessmentNameAndAddColumn < ActiveRecord::Migration[5.2]
  def change
    rename_column :iiht_assessment_settings, :iiht_assessment_name, :iiht_assessment_id_number
    add_column :iiht_assessment_settings, :iiht_schedule_config, :jsonb, defualt: {}
    add_column :campaign_assessments, :external_config, :jsonb, defualt: {}
    add_column :iiht_user_assessments, :schedule_id, :integer
  end
end
