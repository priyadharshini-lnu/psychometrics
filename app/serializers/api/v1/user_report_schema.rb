# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName

module Api
  module V1
    class UserReportSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).filled(:int?)
          required(:name).filled(:str?)
          required(:description).maybe(:str?)
          required(:icon_url).maybe(:str?)
          required(:poster_url).maybe(:str?)
          required(:status).filled(:str?)
          required(:assessments).array do
            schema(UserAssessmentSchema.schema(_, _))
          end
          required(:campaign_id).maybe(:int?)
          required(:output_type).hash do
            required(:pdf).filled(:bool?)
            required(:results).filled(:bool?)
          end
          required(:user_access).maybe(:bool?)
        end
      end
    end
  end
end
# rubocop:enable Lint/UnderscorePrefixedVariableName
