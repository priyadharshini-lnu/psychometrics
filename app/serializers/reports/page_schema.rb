# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName

module Reports
  class PageSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = false

        required(:id).filled(:int?)
        required(:name).filled(:str?)
        required(:position).filled(:int?)
        required(:props).maybe(:hash?)
        required(:display_logic).value { hash? | nil? }
        required(:modules).array(Reports::ModuleSchema.schema(_, _))
      end
    end
  end
end

# rubocop:enable Lint/UnderscorePrefixedVariableName
