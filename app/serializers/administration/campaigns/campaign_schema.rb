# frozen_string_literal: true

# rubocop:disable Metrics/BlockLength
# rubocop:disable Metrics/AbcSize
# rubocop:disable Lint/UnderscorePrefixedVariableName

module Administration
  module Campaigns
    class CampaignSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).maybe(:int?)
          required(:name).maybe(:str?)
          required(:start_date).maybe(:str?)
          required(:end_date).maybe(:str?)
          required(:type).maybe(:str?)
          required(:status).filled(:str?)
          required(:campaign_url).filled(:str?)
          required(:is_threesixty).maybe(:bool?)
          required(:is_fixed_time).filled(:bool?)
          required(:project_id).maybe(:int?)
          required(:practice_campaign).filled(:bool?)
          required(:permissions).hash do
            required(:edit).filled(:bool?)
            required(:copy).maybe(:bool?)
            required(:delete).filled(:bool?)
            required(:manage_campaign_admins).filled(:bool?)
            required(:manage_options).filled(:bool?)
            required(:manage_campaigns).filled(:bool?)
            required(:view_registration_codes).filled(:bool?)
            required(:view_datasheets).filled(:bool?)
            required(:view_sms_invites).filled(:bool?)
            required(:view_dashboard).filled(:bool?)
            required(:view_accesssheet).filled(:bool?)
            required(:view_accesssheet_settings).filled(:bool?)
            required(:view_assessors).filled(:bool?)
            required(:view_workshops).filled(:bool?)
            required(:view_workshop_invites).filled(:bool?)
            required(:stats).filled(:bool?)
            required(:pdf_password).filled(:bool?)
            required(:view_campaign_scoring).filled(:bool?)
            required(:view_campaign_scoring_setting).filled(:bool?)
            required(:manage_campaign_scoring).filled(:bool?)
            required(:view_data_exports).filled(:bool?)
          end
          required(:assessments).array(Administration::Campaigns::AssessmentSchema.schema(_, _))
          required(:reports).array(Administration::Campaigns::ReportSchema.schema(_, _))
        end
      end
    end
  end
end

# rubocop:enable Metrics/BlockLength
# rubocop:enable Metrics/AbcSize
# rubocop:enable Lint/UnderscorePrefixedVariableName
