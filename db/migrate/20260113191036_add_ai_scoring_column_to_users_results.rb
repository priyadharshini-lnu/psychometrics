# frozen_string_literal: true

class AddAIScoringColumnToUsersResults < ActiveRecord::Migration[8.0]
  def change
    change_table :users_results, bulk: true do |t|
      t.integer :ai_scoring_status
    end
  end
end
