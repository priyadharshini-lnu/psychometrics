# frozen_string_literal: true

class AddExpectedProficiencyToSkillsJobRoles < ActiveRecord::Migration[7.1]
  def change
    add_column :skills_job_roles, :expected_proficiency_level, :integer
  end
end
