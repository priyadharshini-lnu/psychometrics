# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName

class TextModuleOverrideSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:id).filled(:int?)
      required(:content).maybe(:str?)
      required(:module_id).filled(:int?)
      required(:user_report_id).filled(:int?)
      required(:updated_at).filled(:str?)
      required(:approved).filled(:bool?)
      required(:editor).hash(::Reports::UserSchema.schema(_, _))
    end
  end
end

# rubocop:enable Lint/UnderscorePrefixedVariableName
