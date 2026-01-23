# frozen_string_literal: true

class AddActiveToMhsUserAssessments < ActiveRecord::Migration[8.0]
  def change
    add_column :mhs_user_assessments, :active, :boolean, default: true, null: false
  end
end
