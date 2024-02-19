# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName

module Reports
  class AssessmentSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = false

        required(:id).filled(:int?)
        required(:name).filled(:str?)
        required(:category).filled(:str?)
        required(:disabled).filled(:bool?)
        required(:created_at).filled(:str?)
        required(:flow).maybe(:hash?)
        required(:norm_rules).value { hash? | array? | nil? }
        required(:factors).maybe(:array?)
        required(:factor_scoring_counters).maybe(:hash?)
        required(:dimension_id).filled(:int?)
        required(:blocks).array(BlockSchema.schema(_, _))
      end
    end
  end
end

# rubocop:enable Lint/UnderscorePrefixedVariableName
