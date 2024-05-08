# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName

module Assessments
  class LinkedAssessmentSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:name).filled(:str?)
        required(:blocks).array(Assessments::BlockSchema.schema(_, _))
      end
    end
  end
end

# rubocop:enable Lint/UnderscorePrefixedVariableName
