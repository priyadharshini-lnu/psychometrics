# frozen_string_literal: true

module Api
  module V2
    module DevelopmentAction
      class Schema < Api::Base::Schema
        def self.resource
          'development_actions'
        end

        def self.attributes(attribute, _)
          proc do
            attribute[:name].filled(:string)
            attribute[:description].filled(:string)
            attribute[:development_action_type].filled(:string)
            attribute[:learning_style].filled(:string)
            optional(:course_url).maybe(:str?)
            optional(:course_start_date).maybe(:any)
            optional(:course_end_date).maybe(:any)
            optional(:image).maybe(:any)
            optional(:available_languages).maybe(:array)
            optional(:duration).maybe(:integer)
          end
        end

        def self.relationships(_)
          [
            { name: :project, resource: :projects, relationship: :one, required: false },
            { name: :skills, resource: :skills, relationship: :many, required: false, allowed_blank: true }
          ]
        end
      end
    end
  end
end
