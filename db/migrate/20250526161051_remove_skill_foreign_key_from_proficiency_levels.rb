# frozen_string_literal: true

class RemoveSkillForeignKeyFromProficiencyLevels < ActiveRecord::Migration[7.1]
  def up
    remove_foreign_key :proficiency_levels, column: :skill_id
  end

  def down
    add_foreign_key :proficiency_levels, :skills, column: :skill_id
  end
end
