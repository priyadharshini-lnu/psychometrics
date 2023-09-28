# frozen_string_literal: true

module Api
  module V2
    module Assessors::Workshop
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
            { name: :campaign, resource: :campaigns, relationship: :one, required: false }
          ]
        end
      end
    end
  end
end
