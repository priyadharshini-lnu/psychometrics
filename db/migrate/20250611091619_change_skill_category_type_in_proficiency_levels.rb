# frozen_string_literal: true

class ChangeSkillCategoryTypeInProficiencyLevels < ActiveRecord::Migration[7.1]
  def up
    change_column :proficiency_levels, :skill_category, :integer, using: 'skill_category::integer'
  end

  def down
    change_column :proficiency_levels, :skill_category, :string, using: 'skill_category::text'
  end
end
