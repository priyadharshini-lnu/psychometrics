# frozen_string_literal: true

class UpdateSkillsAndJobRolesUniquenessConstraints < ActiveRecord::Migration[7.0]
  def up
    # Remove any existing uniqueness constraints on skills
    remove_index :skills, :name if index_exists?(:skills, :name)

    # Add new uniqueness constraint scoped to project_id for skills
    add_index :skills, %i[name project_id], unique: true,
      name: 'index_skills_on_name_and_project_id'

    # Remove and update job roles constraints
    remove_index :job_roles, :name if index_exists?(:job_roles, :name)
    remove_index :job_roles, :code if index_exists?(:job_roles, :code)

    # Add new uniqueness constraints for job roles scoped to project_id
    add_index :job_roles, %i[name project_id], unique: true,
      name: 'index_job_roles_on_name_and_project_id'
    add_index :job_roles, %i[code project_id], unique: true,
      name: 'index_job_roles_on_code_and_project_id'

    # Add project_id to skills_job_roles uniqueness constraint
    remove_index :skills_job_roles, %i[job_role_id skill_id] if index_exists?(:skills_job_roles,
                                                                              %i[job_role_id skill_id])
    add_index :skills_job_roles, %i[job_role_id skill_id project_id], unique: true,
      name: 'index_skills_job_roles_on_job_role_skill_and_project'
  end

  def down
    # Revert changes for skills
    remove_index :skills, %i[name project_id]
    add_index :skills, :name, unique: true

    # Revert changes for job roles
    remove_index :job_roles, %i[name project_id]
    remove_index :job_roles, %i[code project_id]
    add_index :job_roles, :name, unique: true
    add_index :job_roles, :code, unique: true

    # Revert changes for skills job roles
    remove_index :skills_job_roles, %i[job_role_id skill_id project_id]
    add_index :skills_job_roles, %i[job_role_id skill_id], unique: true
  end
end
