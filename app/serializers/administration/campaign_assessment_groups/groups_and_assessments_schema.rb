# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName

module Administration
  module CampaignAssessmentGroups
    class GroupsAndAssessmentsSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true
          required(:groups).array do
            schema(CampaignAssessmentGroups::GroupSchema.schema(_, _))
          end
          required(:assessments).array do
            schema(CampaignAssessmentGroups::CampaignAssessmentSchema.schema(_, _))
          end
        end
      end
    end
  end
end

# rubocop:enable Lint/UnderscorePrefixedVariableName
