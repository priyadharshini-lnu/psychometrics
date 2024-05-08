# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName

module Threesixty
  class UserReportSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = false

        required(:id).filled(:int?)
        required(:status).filled(:str?)
        required(:campaign_id).filled(:int?)
        required(:pdf).maybe(:hash?)
        required(:is_self).filled(:bool?)
        required(:results).maybe(:hash?)
        required(:approval_status).filled(:str?)
        required(:evalaution_completed_for_subject).filled(:bool?)
        required(:report_data).maybe(:array?)
        required(:permissions).hash do
          required(:download).maybe(:bool?)
        end
        required(:report).hash(ReportSchema.schema(_, _))
        required(:module_overrides).maybe do
          array(TextModuleOverrideSchema.schema(_, _))
        end
        required(:options).hash(Threesixty::CampaignOptionsSchema.schema(_, _))
        required(:campaign).maybe do
          hash(Threesixty::CampaignDetailsSchema.schema(_, _))
        end
        required(:user).hash(UserSchema.schema(_, _))
      end
    end
  end
end

# rubocop:enable Lint/UnderscorePrefixedVariableName
