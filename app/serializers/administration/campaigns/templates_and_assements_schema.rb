# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName

module Administration
  module Campaigns
    class TemplatesAndAssementsSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:templates).array(Administration::Campaigns::TemplateSchema.schema(_, _))

          required(:assessments).array(Administration::Campaigns::ShortAssessmentSchema.schema(_, _))
        end
      end
    end
  end
end

# rubocop:enable Lint/UnderscorePrefixedVariableName
