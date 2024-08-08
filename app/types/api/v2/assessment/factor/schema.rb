# frozen_string_literal: true

module Api
  module V2
    module Assessment::Factor
      class Schema < Api::Base::Schema
        def self.resource
          'factors'
        end

        def self.attributes(attribute, _)
          proc do
            attribute[:name].filled(:string)
            attribute[:scoring_strategy].filled(:string)
            attribute[:parent].filled(:bool)
          end
        end

        def self.relationships(_)
          [
            { name: :sub_factors, resource: :factors, relationship: :many, required: false, allowed_blank: true },
            { name: :parent_factors, resource: :factors, relationship: :many, required: false, allowed_blank: true }
          ]
        end
      end
    end
  end
end
