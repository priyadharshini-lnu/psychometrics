# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName

module Api
  module V1
    class DimensionSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).filled(:int?)
          required(:name).filled(:str?)
          required(:occupations).array do
            schema(Api::V1::OccupationSchema.schema(_, _))
          end

          required(:factors).array do
            schema(Api::V1::FactorSchema.schema(_, _))
          end
        end
      end
    end
  end
end

# rubocop:enable Lint/UnderscorePrefixedVariableName
