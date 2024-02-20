# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName

module Api
  module V1
    class ResultSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = false

          required(:user_data).maybe(:hash?)

          required(:assessments).array do
            schema(Api::V1::Results::AssessmentSchema.schema(_, _))
          end

          required(:computed_scores).array do
            schema(Api::V1::Results::ComputedScoreSchema.schema(_, _))
          end

          required(:campaign_id).filled(:int?)
        end
      end
    end
  end
end

# rubocop:enable Lint/UnderscorePrefixedVariableName
