# frozen_string_literal: true

class RenameSkillCategoryToSkillTypeInProficiencyLevels < ActiveRecord::Migration[7.1]
  def change
    rename_column :proficiency_levels, :skill_category, :skill_type
  end
end
