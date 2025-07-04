# frozen_string_literal: true

class AddProjectAndJobGroupToJobRolesAndSkills < ActiveRecord::Migration[7.1]
  def change
    add_column :job_roles, :code, :string, null: true
    add_reference :job_roles, :project, null: true, foreign_key: { to_table: :clients }
    add_reference :job_roles, :job_group, foreign_key: true, null: true

    add_reference :skills, :skill_group, foreign_key: true, null: true
  end
end
