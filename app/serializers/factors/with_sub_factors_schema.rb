# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName

module Factors
  class WithSubFactorsSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:name).filled(:str?)
        required(:code).maybe(:str?)
        required(:parent_id).maybe(:int?)
        required(:question_ids).maybe(:array?)
        required(:description).maybe(:str?)
        required(:icon).maybe(:str?)
        required(:alias).maybe(:str?)
        required(:scoring_strategy).filled(:str?)
        required(:factors_sub_factors).array(FactorsSubFactorSchema.schema(_, _))
      end
    end
  end
end

# rubocop:enable Lint/UnderscorePrefixedVariableName
