# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName

class UserDashboardSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = false

      required(:id).filled(:int?)
      required(:status).filled(:str?)
      required(:campaign_id).filled(:int?)
      required(:pdf).maybe(:hash?)
      required(:is_self).filled(:bool?)
      required(:results).filled(:hash?)
      required(:report).hash(ReportSchema.schema(_, _))
      required(:user).hash(UserSchema.schema(_, _))
    end
  end
end

# rubocop:enable Lint/UnderscorePrefixedVariableName
