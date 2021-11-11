# frozen_string_literal: true

class AddDefaultValueForInstructions < ActiveRecord::Migration[5.2]
  def change
    change_column :assessments, :instructions, :json, default: {}
  end
end
