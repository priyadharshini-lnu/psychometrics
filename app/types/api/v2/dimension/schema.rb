# frozen_string_literal: true

module Api
  module V2
    module Dimension
      class Schema < Api::Base::Schema
        def self.resource
          'dimensions'
        end

        def self.attributes(attribute, _type)
          proc do
            attribute[:name].filled(:string)
            attribute[:default_occupation_condition_set_id].maybe(:integer)
          end
        end

        def self.meta?
          false
        end

        def self.links?
          false
        end

        def self.relationships(_)
          [
            { name: :owner, resource: :clients, relationship: :one, required: false, allowed_blank: true }
          ]
        end
      end
    end
  end
end
