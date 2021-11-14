# frozen_string_literal: true

class AddOptionsFieldToAssessments < ActiveRecord::Migration[5.2]
  def change
    add_column :assessments, :options, :json, default: {}
  end
end
