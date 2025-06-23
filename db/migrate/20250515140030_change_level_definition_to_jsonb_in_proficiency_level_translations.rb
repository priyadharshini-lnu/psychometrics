# frozen_string_literal: true

class ChangeLevelDefinitionToJsonbInProficiencyLevelTranslations < ActiveRecord::Migration[7.1]
  def up
    change_column :proficiency_level_translations, :level_definition, :jsonb, using: 'level_definition::jsonb'
  end

  def down
    change_column :proficiency_level_translations, :level_definition, :text
  end
end
