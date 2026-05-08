# frozen_string_literal: true

module Api
  module V2
    module Question
      class Schema < Api::Base::Schema
        def self.resource
          'questions'
        end

        def self.attributes(attribute, _)
          proc do
            attribute[:name].filled(:string)
            attribute[:type].filled(:string)
            optional(:position).maybe(:integer)
            attribute[:props].hash
            attribute[:validation].hash
            attribute[:required_validation].hash
            attribute[:display_logic].hash
            attribute[:skip_logic].array(:hash?)
            optional(:template_id).maybe(:string)
            attribute[:save_as_template].filled(:bool)
            attribute[:disabled].filled(:bool)
          end
        end

        def self.relationships(_)
          [
            { name: :owner, resource: :clients, relationship: :one, required: false, allowed_blank: true },
            { name: :block, resource: :blocks, relationship: :one, required: false, allowed_blank: true },
            { name: :template, resource: :questions, relationship: :one, required: false, allowed_blank: true },
            { name: :created_by, resource: :users, relationship: :one, required: false },
            { name: :updated_by, resource: :users, relationship: :one, required: false },
            { name: :linked_assessments, resource: :assessments, relationship: :many, required: false }
          ]
        end
      end
    end
  end
end
