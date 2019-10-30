# frozen_string_literal: true

class CreateFactorSubFactorsTable < ActiveRecord::Migration[5.1]
  def change
    create_table :factors_sub_factors do |t|
      t.references :sub_factor, foreign_key: { on_delete: :cascade, to_table: :factors }
      t.references :factor, foreign_key: { on_delete: :cascade }
      t.float :weight, default: 1.0

      t.timestamps
    end

    add_column :factors, :scoring_strategy, :integer, null: false, default: 0, limit: 2
  end
end
