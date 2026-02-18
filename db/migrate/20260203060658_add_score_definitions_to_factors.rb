# frozen_string_literal: true

class AddScoreDefinitionsToFactors < ActiveRecord::Migration[8.0]
  def change
    change_table :factors, bulk: true do |t|
      t.integer :score_min
      t.integer :score_max
      t.jsonb :score_definitions, default: []
    end
  end
end
