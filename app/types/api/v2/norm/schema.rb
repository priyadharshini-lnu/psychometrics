# frozen_string_literal: true

module Api
  module V2
    module Norm
      class Schema < Api::Base::Schema
        def self.resource
          'norms'
        end

        def self.attributes(attribute, _)
          proc do
            attribute[:name].filled(:string)
            attribute[:norm_type].filled(:string)
            attribute[:created_at].filled(:string)
            attribute[:updated_at].filled(:string)
            attribute[:disabled].filled(:bool)
            attribute[:factors_norms_props].maybe(:array_of, :hash)
          end
        end

        def self.create_request
          json_api_attributes do
            required(:name).filled(:string)
            required(:norm_type).filled(:string)
          end
        end

        def self.update_request
          json_api_attributes do
            optional(:name).filled(:string)
            optional(:disabled).filled(:bool)
          end
        end

        def self.relationships(_)
          [
            { name: :dimension, resource: :dimensions, relationship: :one },
            { name: :owner, resource: :clients, relationship: :one, required: false, allowed_blank: true },
            { name: :created_by, resource: :users, relationship: :one, required: false, allowed_blank: true },
            { name: :updated_by, resource: :users, relationship: :one, required: false, allowed_blank: true }
          ]
        end
      end
    end
  end
end
