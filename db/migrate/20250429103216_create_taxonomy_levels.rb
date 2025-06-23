# frozen_string_literal: true

class CreateTaxonomyLevels < ActiveRecord::Migration[7.1]
  def change
    create_table :taxonomy_levels do |t|
      t.references :project, null: true, foreign_key: { to_table: :clients }
      t.string :hierarchy_type, null: false
      t.integer :depth
      t.string :label

      t.timestamps
    end

    add_index :taxonomy_levels,
              %i[project_id hierarchy_type depth],
              unique: true
  end
end
