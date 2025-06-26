# frozen_string_literal: true

class CreateProficiencyLevels < ActiveRecord::Migration[6.1]
  def change
    create_table :proficiency_levels do |t|
      t.references :project, foreign_key: { to_table: :clients, on_delete: :cascade }, null: false
      t.string :proficiency_type, null: false # all_skills, by_category, by_skill
      t.string :skill_category
      t.bigint :skill_id
      t.integer :level, null: false
      t.jsonb :level_definition, default: [], null: false

      t.timestamps
    end

    add_index :proficiency_levels, :skill_id
    add_index :proficiency_levels, :proficiency_type
  end
end
