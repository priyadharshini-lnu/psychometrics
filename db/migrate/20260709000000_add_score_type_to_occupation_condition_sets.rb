# frozen_string_literal: true

class AddScoreTypeToOccupationConditionSets < ActiveRecord::Migration[7.1]
  def change
    add_column :occupation_condition_sets, :score_type, :integer, null: false, default: 0
  end
end
