# frozen_string_literal: true

class CreateProficiencyLevelTranslations < ActiveRecord::Migration[7.1]
  def change
    create_table :proficiency_level_translations do |t|
      t.references :proficiency_level, null: false, foreign_key: true
      t.string :locale, null: false
      t.text :level_definition

      t.timestamps
    end

    add_index :proficiency_level_translations, %i[proficiency_level_id locale], unique: true
  end
end
