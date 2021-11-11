# frozen_string_literal: true

class AddInstructionsToAssessments < ActiveRecord::Migration[5.2]
  def change
    add_column :assessments, :instructions, :json
  end
end
