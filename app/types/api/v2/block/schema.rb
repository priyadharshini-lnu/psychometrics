# frozen_string_literal: true

module Api
  module V2
    module Block
      class Schema < Api::Base::Schema
        def self.resource
          'blocks'
        end

        def self.attributes(attribute, type)
          proc do
            attribute[:name].filled(:string)
            attribute[:block_type].maybe(:string)
            attribute[:position].filled(:integer)
            attribute[:props].hash
            if type == :create
              optional(:template_id).maybe(:string)
              optional(:save_as_template).maybe(:bool)
              optional(:disabled).maybe(:bool)
            else
              attribute[:template_id].maybe(:string)
              attribute[:save_as_template].maybe(:bool)
              attribute[:disabled].maybe(:bool)
            end
          end
        end

        def self.relationships(_)
          [
            { name: :owner, resource: :clients, relationship: :one, required: false, allowed_blank: true },
            { name: :questions, resource: :questions, relationship: :many, required: false },
            { name: :template, resource: :blocks, relationship: :one, required: false },
            { name: :created_by, resource: :users, relationship: :one, required: false },
            { name: :updated_by, resource: :users, relationship: :one, required: false },
            { name: :linked_assessments, resource: :assessments, relationship: :many, required: false }
          ]
        end
      end
    end
  end
end
