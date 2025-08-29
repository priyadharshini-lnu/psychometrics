# frozen_string_literal: true

module Api
  module V2
    module SkillsJobRole
      class Contract < Api::Base::Contract
        config.messages.namespace = :skills_job_roles

        rule(data: { attributes: :skill_id }) do
          key.failure(:filled?) if key? && value.blank?
        end

        rule(data: { attributes: :job_role_id }) do
          key.failure(:filled?) if key? && value.blank?
        end

        rule(:data) do
          job_role_id = values.dig(:data, :attributes, :job_role_id)
          skill_id = values.dig(:data, :attributes, :skill_id)

          next unless job_role_id && skill_id

          job_role = ::JobRole.find_by(id: job_role_id)
          skill = ::Skill.find_by(id: skill_id)

          if job_role && skill
            job_role_project_id = job_role.project_id
            skill_project_id = skill.project_id

            unless job_role_project_id.nil? || skill_project_id.nil? || job_role_project_id == skill_project_id
              key.failure(:must_belong_to_same_project_or_be_global)
            end
          end
        end

        rule(data: { attributes: :job_role_id }) do
          job_role_id = values.dig(:data, :attributes, :job_role_id)
          skill_id = values.dig(:data, :attributes, :skill_id)

          if skill_id && job_role_id
            existing_skill_job_role_mapping = ::SkillsJobRole.find_by(
              skill_id: skill_id,
              job_role_id: job_role_id
            )

            if existing_skill_job_role_mapping && existing_skill_job_role_mapping.id.to_s != _context[:params][:id]
              key.failure(:unique_mappings)
            end
          end
        end
      end
    end
  end
end
