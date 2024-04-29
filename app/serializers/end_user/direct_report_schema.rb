# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName
module EndUser
  class DirectReportSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:status).filled(:str?)
        required(:user).filled(UserSchema.schema(_, _))
      end
    end
  end
end
# rubocop:enable Lint/UnderscorePrefixedVariableName
