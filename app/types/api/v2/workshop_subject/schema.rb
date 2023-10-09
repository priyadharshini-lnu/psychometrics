# frozen_string_literal: true

module Api
  module V2
    module WorkshopSubject
      class Schema < Api::Base::Schema
        def self.resource
          'workshop_subjects'
        end

        def self.attributes(attribute, type)
          proc do
            if type == :update
              attribute[:attendance_status].filled(:string)
              attribute[:attended].filled(:bool)
            end
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
