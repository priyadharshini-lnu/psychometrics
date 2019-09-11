# frozen_string_literal: true

class AddEnableBackToAssessments < ActiveRecord::Migration[5.1]
  def change
    add_column :assessments, :enable_back, :boolean, default: false, null: false
  end
end
