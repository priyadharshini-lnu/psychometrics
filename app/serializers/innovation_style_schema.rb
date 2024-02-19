# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName

class InnovationStyleSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      optional(:id).filled(:int?)
      optional(:name).filled(:str?)
      optional(:description).filled(:str?)
      optional(:full_description).filled(:str?)
      optional(:icon).maybe(:str?)
      optional(:factors).array(InnovationStylesFactorSchema.schema(_, _))
      optional(:position).maybe(:int?)
    end
  end
end

# rubocop:enable Lint/UnderscorePrefixedVariableName
