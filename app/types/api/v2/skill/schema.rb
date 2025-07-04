# frozen_string_literal: true

module Api
  module V2
    module Skill
      class Schema < Api::Base::Schema
        def self.resource
          'skills'
        end

        def self.attributes(attribute, type)
          proc do
            if type == :import
              attribute[:file].filled
            else
              attribute[:name].filled(:string)
              attribute[:skill_type].filled(:string)
              attribute[:description].filled(:string)
              optional(:global).maybe(:bool)
              optional(:skill_group_id).maybe(:string)
            end
          end
        end

        def self.relationships(_)
          [
            { name: :project, resource: :projects, relationship: :one, required: false, allowed_blank: true }
          ]
        end
      end
    end
  end
end
