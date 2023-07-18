# frozen_string_literal: true

module Api
  module V2
    module Workshop
      class Schema < Api::Base::Schema
        def self.resource
          'workshops'
        end

        def self.attributes(attribute, _)
          proc do
            attribute[:start_time].filled(:string)
            attribute[:duration].filled(:integer)
          end
        end

        def self.relationships(_)
          [
            { name: :managers, resource: :workshop_managers, relationship: :many, required: false },
            { name: :assessors, resource: :workshop_assessors, relationship: :many, required: false }
          ]
        end
      end
    end
  end
end
