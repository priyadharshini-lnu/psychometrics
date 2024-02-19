# frozen_string_literal: true

# rubocop:disable Metrics/AbcSize
# rubocop:disable Metrics/BlockLength
# rubocop:disable Lint/UnderscorePrefixedVariableName

class UserReportSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = false

      required(:id).filled(:int?)
      required(:status).filled(:str?)
      required(:campaign_id).filled(:int?)
      required(:pdf).hash do
        required(:url).maybe(:str?)
      end
      required(:is_self).filled(:bool?)
      required(:results).maybe(:hash?)
      required(:approval_status).filled(:str?)
      required(:evalaution_completed_for_subject).maybe(:bool?)
      required(:report_data).maybe(:array?)
      required(:permissions).hash do
        required(:download).filled(:bool?)
        required(:manage_qc).filled(:bool?)
        required(:manage_approval).filled(:bool?)
      end
      required(:comments).array(UserReportCommentSchema.schema(_, _))
      required(:require_approval).filled(:bool?)
      required(:campaign_factor_results).array do
        hash do
          required(:code).filled(:str?)
          required(:value).filled(:int?)
        end
      end
      required(:module_overrides).array(TextModuleOverrideSchema.schema(_, _))
      required(:report).hash(ReportSchema.schema(_, _))
      required(:user_report_events).array(UserReportEventSchema.schema(_, _))
      required(:user).hash(UserSchema.schema(_, _))
      required(:options).hash(Threesixty::CampaignOptionsSchema.schema(_, _))
    end
  end
end

# rubocop:enable Metrics/AbcSize
# rubocop:enable Metrics/BlockLength
# rubocop:enable Lint/UnderscorePrefixedVariableName
