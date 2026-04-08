# frozen_string_literal: true

module Api
  module V2
    module Dimension::Factor
      class Schema < Api::Base::Schema
        def self.resource
          'factors'
        end

        def self.attributes(attribute, type)
          proc do
            attribute[:name].filled(:string)
            attribute[:code].filled(:string)
            attribute[:scoring_strategy].filled(:string)
            optional(:description).maybe(:string)
            optional(:precision).maybe(:integer)
            optional(:factors_sub_factors).maybe(:array).each do
              schema do
                optional(:id).maybe(:string)
                optional(:predicate).maybe(:string)
                optional(:weight).maybe(Types::Integer | Types::Float)
                optional(:value).maybe(Types::Integer | Types::Float)
                optional(:position).maybe(:integer)
              end
            end
            optional(:purge_icon).maybe(:bool) if type == :update
          end
        end

        def self.relationships(_)
          [
            { name: :parent_factors, resource: :factors, relationship: :many, required: false, allowed_blank: true },
            { name: :dimension, resource: :dimensions, relationship: :one, required: true, allowed_blank: false }
          ]
        end
      end
    end
  end
end
