# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName

module Api
  module V1
    class CampaignAssessmentsAndReportsSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:reports).array do
            schema do
              required(:id).filled(:int?)
              required(:report_bundle_id).filled(:int?)
              required(:user_access).filled(:bool?)
            end
          end

          required(:assessments).array do
            schema(Api::V1::CampaignAssessmentSchema.schema(_, _))
          end
        end
      end
    end
  end
end
# rubocop:enable Lint/UnderscorePrefixedVariableName
