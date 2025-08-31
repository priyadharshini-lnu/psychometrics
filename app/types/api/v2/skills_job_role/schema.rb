# frozen_string_literal: true

module Api
  module V2
    module SkillsJobRole
      class Schema < Api::Base::Schema
        def self.resource
          'skills_job_roles'
        end

        def self.attributes(attribute, _type)
          proc do
            optional(:expected_proficiency_level).maybe(:integer)
            attribute[:job_role_id].filled(:integer)
            attribute[:skill_id].filled(:integer)
            attribute[:project_id].maybe(:integer)
          end
        end
      end
    end
  end
end
