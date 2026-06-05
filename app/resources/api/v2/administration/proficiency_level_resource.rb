# frozen_string_literal: true

module Api
  module V2
    module Administration
      class ProficiencyLevelResource < Api::V2::Administration::BaseResource
        attributes :skill_type, :level, :level_definition, :project_id, :skill_id, :proficiency_type

        has_one :project, class_name: 'Client'
        has_one :skill

        ransack_filters %i[proficiency_type_in skill_type_in skill_name_in level_in filterable_fields project_id_eq
                           include_global global]

        def self.records(opts = {})
          project_id = opts[:context][:project]&.id ||
                       opts[:context][:params].dig('filter', 'project_id')&.to_i

          ::Api::Administration::ProficiencyLevelPolicy::Scope.new(
            opts[:context][:user],
            ::ProficiencyLevel,
            {
              project_id: project_id,
              filter: opts[:context][:filter] || opts[:context][:params]['filter']
            }
          ).resolve.
            includes(:translations, skill: :translations)
        end

        def skill_id
          @model.skill_id.to_s
        end

        def self.sortable_fields(context)
          super + %i[skill.name project.name]
        end
      end
    end
  end
end
