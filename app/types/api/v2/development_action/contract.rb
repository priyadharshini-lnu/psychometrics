# frozen_string_literal: true

module Api
  module V2
    module DevelopmentAction
      class Contract < Api::Base::Contract
        config.messages.namespace = :development_actions

        rule(data: { relationships: :skills }) do
          skill_ids = values.dig(:data, :relationships, :skills, :data).pluck(:id)

          key.failure(:skills_required) if skill_ids.empty?
        end

        rule(data: { relationships: :skills }) do
          skill_ids = values.dig(:data, :relationships, :skills, :data).pluck(:id)
          project_id = values.dig(:data, :relationships, :project, :data, :id)

          skills = ::Skill.where(id: skill_ids)

          if project_id.present? && skills.exists?(['project_id != ? OR project_id IS NULL', project_id])
            key.failure(:skills_not_belong_to_project)
          end

          if project_id.blank? && skills.where.not(project_id: nil).exists?
            key.failure(:only_global_skills_allowed)
          end
        end
      end
    end
  end
end
