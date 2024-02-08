# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName

module Api
  module V1
    module Results
      class AssessmentSchema < BaseSchema
        def self.schema(_, _)
          Dry::Schema.JSON do
            config.validate_keys = true

            required(:id).filled(:int?)
            required(:name).filled(:str?)
            required(:results).hash do
              required(:normed_factors).array do
                schema(Api::V1::Results::FactorSchema.schema(_, _))
              end
              required(:raw_factors).array do
                schema(Api::V1::Results::FactorSchema.schema(_, _))
              end
              required(:ranked_occupations).array do
                schema(Api::V1::Results::RankedOccupationSchema.schema(_, _))
              end
            end
          end
        end
      end
    end
  end
end

# rubocop:enable Lint/UnderscorePrefixedVariableName
