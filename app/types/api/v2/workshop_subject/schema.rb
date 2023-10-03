# frozen_string_literal: true

module Api
  module V2
    module WorkshopSubject
      class Schema < Api::Base::Schema
        def self.resource
          'workshop_subjects'
        end

        def self.attributes(attribute, _)
          proc do
            attribute[:attendance_status].filled(:string)
            attribute[:attended].filled(:bool)
          end
        end

        def self.create_request
          json_api_attributes do
            nil
          end
        end

        def self.relationships(_)
          [
            { name: :user, resource: :users, relationship: :one },
            { name: :workshop, resource: :workshops, relationship: :one }
          ]
        end
      end
    end
  end
end
