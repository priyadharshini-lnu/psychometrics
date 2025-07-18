# frozen_string_literal: true

# This file is not being used, but if we remove this it causes exception due to json-resource gem checking for this file

module Api
  module V2
    module Administration
      module Projects
        class ProficiencyLevelResource < Api::V2::Administration::BaseResource
          attributes :skill_type, :level, :level_definition, :project_id, :skill_id, :proficiency_type

          has_one :project, class_name: 'Client'
          belongs_to :skill
        end
      end
    end
  end
end
