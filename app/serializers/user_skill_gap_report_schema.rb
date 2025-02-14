# frozen_string_literal: true

class UserSkillGapReportSchema < BaseSchema
  # rubocop:disable Lint/UnderscorePrefixedVariableName
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = false

      required(:id).filled(:int?)
      required(:status).filled(:str?)
      required(:campaign_id).filled(:int?)
      required(:pdf).maybe(:hash?)
      required(:is_self).filled(:bool?)
      required(:results).maybe(:hash?)
      required(:report_data).maybe(:array?)
      required(:report_url).filled(:str?)
      required(:report).hash(ReportSchema.schema(_, _))
      required(:user).hash(::Reports::UserSchema.schema(_, _))
    end
  end
  # rubocop:enable Lint/UnderscorePrefixedVariableName
end
