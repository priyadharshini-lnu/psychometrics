# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName

class FactorSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:id).filled(:int?)
      required(:name).filled(:bool?)
      required(:code).filled(:str?)
      required(:description).filled(:int?)
      required(:icon).filled(:str?)
      required(:scoring_strategy).filled(:float?)
      required(:use_percentage).maybe(:int?)
      required(:use_sub_factor_norm_score).filled(:int?)
      required(:external_scoring).filled(:str?)
      required(:scale_min).filled(:float?)
      required(:scale_max).maybe(:int?)
      required(:custom_formula).maybe(:int?)
      required(:factors_sub_factors).array(FactorsSubFactorSchema.schema(_, _))
    end
  end
end

# rubocop:enable Lint/UnderscorePrefixedVariableName
