# frozen_string_literal: true

class AddDataRoleToAssessments < ActiveRecord::Migration[8.0]
  def change
    add_column :assessments, :data_role, :integer, default: 0, null: false
  end
end
