# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName

class InnovationStyleSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      optional(:id).filled(:int?)
      optional(:name).filled(:str?)
      optional(:description).maybe(:str?)
      optional(:full_description).maybe(:str?)
      optional(:icon).maybe(:str?)
      optional(:factors).array(InnovationStylesFactorSchema.schema(_, _))
      optional(:position).maybe(:int?)
    end
  end
end

# rubocop:enable Lint/UnderscorePrefixedVariableName
