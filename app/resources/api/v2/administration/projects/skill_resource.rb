# frozen_string_literal: true

module Api
  module V2
    module Administration
      module Projects
        class SkillResource < Api::V2::Administration::SkillResource
          has_one :project, class_name: 'Client'
        end
      end
    end
  end
end
