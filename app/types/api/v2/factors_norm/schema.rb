# frozen_string_literal: true

module Api
  module V2
    module FactorsNorm
      class Schema < Api::Base::Schema
        def self.resource
          'factors_norms'
        end

        def self.attributes(attribute, _)
          proc do
            attribute[:norm_id].filled(:integer)
            attribute[:factor_id].filled(:integer)
            attribute[:props].maybe(:array_of, :hash) do
              required(:level).filled(:string)
              required(:score_from).filled(:float)
              required(:score_to).filled(:float)
            end
          end
        end

        def self.update_request
          json_api_attributes do
            required(:norm_id).filled(:integer)
            required(:factor_id).filled(:integer)
            required(:level).filled(:string)
            required(:field_name).filled(:string)
            required(:field_value).maybe(:string)
          end
        end
      end
    end
  end
end
