# frozen_string_literal: true

class CreateFactorBenchmarkScores < ActiveRecord::Migration[7.1]
  def change
    create_table :factor_benchmark_scores do |t|
      t.decimal :benchmark_score
      t.references :factor, null: false, foreign_key: true
      t.references :campaign, null: false, foreign_key: true
      t.references :assessment, null: false, foreign_key: true

      t.timestamps
    end
  end
end
