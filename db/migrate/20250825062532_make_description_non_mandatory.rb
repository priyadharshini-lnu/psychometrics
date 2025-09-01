# frozen_string_literal: true

class MakeDescriptionNonMandatory < ActiveRecord::Migration[7.1]
  def up
    change_column_null :job_roles, :description, true
    change_column_null :skills, :description, true
  end

  def down
    change_column_null :job_roles, :description, false
    change_column_null :skills, :description, false
  end
end
