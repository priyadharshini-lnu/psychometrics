# frozen_string_literal: true

class ChangeSkillIdToReferenceInProficiencyLevels < ActiveRecord::Migration[7.1]
  def change
    # Remove the old skill_id column
    remove_column :proficiency_levels, :skill_id, :bigint

    # Add proper reference to the skills table
    add_reference :proficiency_levels, :skill, foreign_key: { to_table: :skills, on_delete: :nullify }, index: true
  end
end
