# frozen_string_literal: true

class ChangeProjectIdNullConstraintInProficiencyLevels < ActiveRecord::Migration[7.1]
  def change
    change_column_null :proficiency_levels, :project_id, true
  end
end
