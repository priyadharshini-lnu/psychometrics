# frozen_string_literal: true

module Api
  module V2
    module UserAssessment
      class Schema < Api::Base::Schema
        def self.resource
          'user_assessments'
        end

        def self.attributes(attribute, _)
          proc do
            attribute[:status].filled(:string)
            attribute[:schedule_time].maybe(:string)
          end
        end

        def self.relationships(_)
          [{ name: :subject, resource: :users, relationship: :one },
           { name: :assessor, resource: :users, relationship: :one },
           { name: :assessment, resource: :assessments, relationship: :one }]
        end
      end
    end
  end
end
