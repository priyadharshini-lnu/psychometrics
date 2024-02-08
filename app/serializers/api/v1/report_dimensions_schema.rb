# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName

module Api
  module V1
    class ReportDimensionsSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:server_time).filled(:str?)
          required(:dimensions).array do
            schema(Api::V1::DimensionSchema.schema(_, _))
          end
        end
      end
    end
  end
end

# rubocop:enable Lint/UnderscorePrefixedVariableName
