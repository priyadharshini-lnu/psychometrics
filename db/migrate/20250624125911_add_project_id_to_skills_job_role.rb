# frozen_string_literal: true

class AddProjectIdToSkillsJobRole < ActiveRecord::Migration[7.1]
  def change
    add_reference :skills_job_roles, :project, null: true, foreign_key: { to_table: :clients }
  end
end
