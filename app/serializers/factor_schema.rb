# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName

class FactorSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = false

      required(:id).maybe(:int?)
      required(:name).maybe(:str?)
      required(:code).maybe(:str?)
      required(:description).maybe(:str?)
      required(:icon).maybe(:str?)
      required(:scoring_strategy).filled(:str?)
      required(:use_percentage).filled(:bool?)
      required(:use_sub_factor_norm_score).maybe(:bool?)
      required(:external_scoring).value { hash? | array? | nil? }
      required(:scale_min).maybe(:float?)
      required(:scale_max).maybe(:float?)
      required(:custom_formula).maybe(:str?)
      required(:factors_sub_factors).array(FactorsSubFactorSchema.schema(_, _))
    end
  end
end

# rubocop:enable Lint/UnderscorePrefixedVariableName
