# frozen_string_literal: true

# rubocop:disable Metrics/AbcSize
# rubocop:disable Metrics/BlockLength

module Administration
  module Campaigns
    class CurrentUserSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).filled(:int?)
          required(:grants).maybe do
            hash do
              optional(:users).maybe(:array).each(:str?)
              optional(:results).maybe(:array).each(:str?)
              optional(:assessors).maybe(:array).each(:str?)
              optional(:campaigns).maybe(:array).each(:str?)
              optional(:messages).maybe(:array).each(:str?)
              optional(:clients).maybe(:array).each(:str?)
              optional(:projects).maybe(:array).each(:str?)
              optional(:workshops).maybe(:array).each(:str?)
              optional(:datasheets).maybe(:array).each(:str?)
              optional(:sms_invites).maybe(:array).each(:str?)
              optional(:communications).maybe(:array).each(:str?)
              optional(:registration_codes).maybe(:array).each(:str?)
              optional(:dashboards).maybe(:array).each(:str?)
              optional(:project_settings).maybe(:array).each(:str?)
              optional(:reports).maybe(:array).each(:str?)
              optional(:campaign_factors).maybe(:array).each(:str?)
            end
          end
          required(:role).filled(:str?)
          required(:role_title).filled(:str?)
          required(:permissions).hash do
            required(:canManageProject).filled(:bool?)
            required(:manageProjectAdmins).filled(:bool?)
            required(:manageProjectSmtpSettings).filled(:bool?)
            required(:manageProjectWebhooks).filled(:bool?)
            required(:manageProjectGeneralSettings).filled(:bool?)
            required(:manageProjectSamlSetting).filled(:bool?)
            required(:manageProjectIntegrations).filled(:bool?)
            required(:manageProjectSecuritySettings).filled(:bool?)
            required(:manageProjectIntegrations).filled(:bool?)
            required(:manageProfileSettings).filled(:bool?)
            required(:manageDesignSettings).filled(:bool?)
            required(:workshopStatusExport).filled(:bool?)
          end
          required(:name).filled(:str?)
        end
      end
    end
  end
end

# rubocop:enable Metrics/AbcSize
# rubocop:enable Metrics/BlockLength
