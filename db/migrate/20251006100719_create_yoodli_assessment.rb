# frozen_string_literal: true

class CreateYoodliAssessment < ActiveRecord::Migration[7.1]
  def change
    create_table :yoodli_assessments do |t|
      t.string :product_id, null: false
      t.string :name, null: false
      t.references :project, foreign_key: { to_table: :clients, on_delete: :cascade }
      t.timestamps
    end

    add_index :yoodli_assessments, %i[product_id project_id], unique: true
  end
end
