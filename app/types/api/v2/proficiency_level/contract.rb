# frozen_string_literal: true

module Api
  module V2
    module ProficiencyLevel
      class Contract < Api::Base::Contract
        schema Api::V2::ProficiencyLevel::Schema.create_request

        # Validate presence and uniqueness for `by_skill`
        rule(data: { attributes: :proficiency_type }) do
          attrs = values[:data][:attributes]
          type = attrs[:proficiency_type]
          next unless type == 'by_skill'

          project_id = values.dig(:data, :relationships, :project, :data, :id)&.to_i
          skill_id = values.dig(:data, :relationships, :skill, :data, :id)&.to_i

          if skill_id.blank?
            key.failure(I18n.t('administration.proficiency_levels.errors.create.skill_must_exist'))
          elsif ::ProficiencyLevel.exists?(proficiency_type: 'by_skill', project_id: project_id, skill_id: skill_id)
            key.failure(I18n.t('administration.proficiency_levels.errors.create.proficiency_level_exists'))
          end
        end

        # Validate presence and uniqueness for `by_type`
        rule(data: { attributes: :proficiency_type }) do
          attrs = values[:data][:attributes]
          type = attrs[:proficiency_type]
          next unless type == 'by_type'

          skill_type = attrs[:skill_type]
          project_id = values.dig(:data, :relationships, :project, :data, :id)&.to_i

          if skill_type.blank?
            key.failure(
              I18n.t(
                'administration.proficiency_levels.errors.create.global_category_not_allowed_for_project'
              )
            )

          elsif ::ProficiencyLevel.exists?(proficiency_type: 'by_type', project_id: project_id,
                                           skill_type: skill_type)
            key.failure(I18n.t('administration.proficiency_levels.errors.create.proficiency_level_exists_for_type'))
          end
        end

        # Validate presence and uniqueness for `default`
        rule(data: { attributes: :proficiency_type }) do
          attrs = values[:data][:attributes]
          type = attrs[:proficiency_type]
          next unless type == 'default'

          attrs[:skill_type]
          project_id = values.dig(:data, :relationships, :project, :data, :id)&.to_i

          if project_id
            if ::ProficiencyLevel.exists?(proficiency_type: 'default', project_id: project_id)
              key.failure(I18n.t('administration.proficiency_levels.errors.create.project_level_default_exists'))
            end
          elsif ::ProficiencyLevel.exists?(proficiency_type: 'default', project_id: nil)
            key.failure(
              I18n.t('administration.proficiency_levels.errors.create.proficiency_level_exists_for_default')
            )
          end
        end

        rule(data: { attributes: :level }) do
          attrs = values[:data][:attributes]
          level = attrs[:level]
          level_definition = attrs[:level_definition]

          if level_definition.is_a?(Array)
            if level_definition.size != level
              key.failure(
                I18n.t(
                  'administration.proficiency_levels.errors.create.level_definition_must_match_level',
                  expected: level,
                  actual: level_definition.size
                )
              )
            end
          else
            key.failure(I18n.t('administration.proficiency_levels.errors.create.invalid_format'))
          end
        end
      end
    end
  end
end
