# frozen_string_literal: true

module Api
  module V2
    module Library
      class Schema < Api::Base::Schema
        def self.resource
          'libraries'
        end

        def self.attributes(attribute, _)
          proc do
            attribute[:type].filled(:string)
            attribute[:name].filled(:string)
            attribute[:description].maybe(:string)
            optional(:owner_id).maybe(:string)
            optional(:parent_id).maybe(:string)
          end
        end

        def self.relationships(_)
          [
            { name: :owner, resource: :clients, relationship: :one, required: false, allowed_blank: true },
            { name: :created_by, resource: :users, relationship: :one, required: false, allowed_blank: true }
          ]
        end
      end
    end
  end
end
