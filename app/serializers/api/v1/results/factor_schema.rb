# frozen_string_literal: true

module Api
  module V1
    module Results
      class FactorSchema < BaseSchema
        def self.schema(_, _)
          Dry::Schema.JSON do
            config.validate_keys = true

            required(:id).filled(:int?)
            required(:name).filled(:str?)
            required(:value).value { int? | float? | nil? }
          end
        end
      end
    end
  end
end
