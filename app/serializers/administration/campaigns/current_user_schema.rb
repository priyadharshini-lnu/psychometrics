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
              optional(:users).filled(:array).each(:str?)
              optional(:results).filled(:array).each(:str?)
              optional(:assessors).filled(:array).each(:str?)
              optional(:campaigns).filled(:array).each(:str?)
              optional(:messages).filled(:array).each(:str?)
              optional(:clients).filled(:array).each(:str?)
              optional(:projects).filled(:array).each(:str?)
              optional(:workshops).filled(:array).each(:str?)
              optional(:datasheets).filled(:array).each(:str?)
              optional(:sms_invites).filled(:array).each(:str?)
              optional(:communications).filled(:array).each(:str?)
              optional(:registration_codes).filled(:array).each(:str?)
              optional(:dashboards).filled(:array).each(:str?)
              optional(:project_settings).filled(:array).each(:str?)
              optional(:reports).filled(:array).each(:str?)
              optional(:campaign_factors).filled(:array).each(:str?)
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
          end
          required(:name).filled(:str?)
        end
      end
    end
  end
end

# rubocop:enable Metrics/AbcSize
# rubocop:enable Metrics/BlockLength
