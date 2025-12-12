# frozen_string_literal: true

class DropYoodliAssessment < ActiveRecord::Migration[8.0]
  def change
    drop_table :yoodli_assessments do |t|
      t.string :product_id, null: false
      t.string :name, null: false
      t.references :project, foreign_key: { to_table: :clients, on_delete: :cascade }
      t.timestamps

      t.index %i[product_id project_id], unique: true
    end
  end
end
