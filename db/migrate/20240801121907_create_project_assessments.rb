# frozen_string_literal: true

class CreateProjectAssessments < ActiveRecord::Migration[7.1]
  def change
    create_table :project_assessments do |t|
      t.references :assessment, foreign_key: { on_delete: :cascade }, null: false
      t.references :project, foreign_key: { to_table: :clients, on_delete: :cascade }, null: false
      t.boolean :normalize_factor_scores, default: false

      t.timestamps
    end
  end
end
