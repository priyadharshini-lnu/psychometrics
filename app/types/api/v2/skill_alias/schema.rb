# frozen_string_literal: true

module Api
  module V2
    module SkillAlias
      class Schema < Api::Base::Schema
        def self.resource
          'skill_aliases'
        end

        def self.attributes(attribute, type)
          proc do
            attribute[:name].filled(:string)
            attribute[:skill_id].filled(:string)

            # Include client_id only for operations other than create and update
            unless %i[create update].include?(type)
              attribute[:client_id].filled(:string)
            end
          end
        end
      end
    end
  end
end
