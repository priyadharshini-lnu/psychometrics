# frozen_string_literal: true

class CreateMicrositeAssessments < ActiveRecord::Migration[8.0]
  def change
    create_table :microsite_assessments do |t| # rubocop:disable CustomRubocops/CreateTableMigrationRequiresTenantId
      t.string :product_id, null: false
      t.string :name, null: false
      t.jsonb :metadata

      t.references :project, foreign_key: { to_table: :clients, on_delete: :cascade }

      t.timestamps
    end

    add_index :microsite_assessments, :product_id, unique: true
  end
end
