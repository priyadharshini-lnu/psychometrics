# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName

class AssignUpdateSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:expired).filled(:bool?)
      required(:current_block).maybe(BlockSchema.schema(_, _))
    end
  end
end

# rubocop:enable Lint/UnderscorePrefixedVariableName
