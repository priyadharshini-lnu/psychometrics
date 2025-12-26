# frozen_string_literal: true

module Api
  module V2
    module ProjectFeature
      class Schema < Api::Base::Schema
        def self.resource
          'project_features'
        end

        def self.attributes(attribute, _type)
          proc do
            attribute[:sms_notification].maybe(:bool)
            attribute[:ai_assistants].maybe(:bool)
            attribute[:ai_assisted_idp].maybe(:bool)
            attribute[:global_skills].maybe(:bool)
            attribute[:enhance_with_ai].maybe(:bool)
            attribute[:idp].maybe(:bool)
          end
        end

        def self.relationships(_)
          [
            { name: :project, resource: :projects, relationship: :one }
          ]
        end
      end
    end
  end
end
