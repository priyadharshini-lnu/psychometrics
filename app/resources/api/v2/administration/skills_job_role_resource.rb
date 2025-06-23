# frozen_string_literal: true

class Api::V2::Administration::SkillsJobRoleResource < Api::V2::Administration::BaseResource
  attributes :expected_proficiency_level, :skill_id, :job_role_id

  has_one :skill
  has_one :job_role

  ransack_filters %i[skill_name_or_job_role_name_cont skill_id_eq job_role_id_eq expected_proficiency_level_eq
                     include_global_skills_job_roles global]

  def self.sortable_fields(context)
    super + %i[skill.name job_role.name]
  end

  def self.records(opts = {})
    ::Api::Administration::SkillsJobRolePolicy::Scope.new(
      opts[:context][:user], ::SkillsJobRole,
      { project_id: opts[:context][:project]&.id,
        filter: opts[:context][:filter] }
    ).resolve
  end
end
