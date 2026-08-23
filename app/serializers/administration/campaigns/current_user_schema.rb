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
              optional(:audit_reports).maybe(:array).each(:str?)
              optional(:communications).maybe(:array).each(:str?)
              optional(:registration_codes).maybe(:array).each(:str?)
              optional(:dashboards).maybe(:array).each(:str?)
              optional(:project_settings).maybe(:array).each(:str?)
              optional(:reports).maybe(:array).each(:str?)
              optional(:campaign_factors).maybe(:array).each(:str?)
              optional(:norms).maybe(:array).each(:str?)
              optional(:questions).maybe(:array).each(:str?)
              optional(:audit_logs).maybe(:array).each(:str?)
              optional(:dimensions).maybe(:array).each(:str?)
              optional(:assessments).maybe(:array).each(:str?)
              optional(:media_libraries).maybe(:array).each(:str?)
              optional(:idp_templates).maybe(:array).each(:str?)
              optional(:libraries).maybe(:array).each(:str?)
              optional(:sms_histories).maybe(:array).each(:str?)
              optional(:registration_settings).maybe(:array).each(:str?)
              optional(:skills).maybe(:array).each(:str?)
              optional(:development_actions).maybe(:array).each(:str?)
              optional(:proficiency_levels).maybe(:array).each(:str?)
              optional(:response_meta).maybe(:array).each(:str?)
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
            required(:manageProjectPrivacySetting).filled(:bool?)
            required(:manageProfileSettings).filled(:bool?)
            required(:manageDesignSettings).filled(:bool?)
            required(:workshopStatusExport).filled(:bool?)
            required(:manageProjectAssessments).filled(:bool?)
            required(:viewAuditReports).filled(:bool?)
            required(:accessProjectDevelopmentActions).filled(:bool?)
            required(:accessIdpTemplates).filled(:bool?)
            required(:accessReflectionQuestions).filled(:bool?)
            required(:manageProjectFeatureFlags).filled(:bool?)
            required(:accessProjectTaxonomy).filled(:bool?)
            required(:viewDatasheets).filled(:bool?)
            required(:manageDatasheets).filled(:bool?)
          end
          required(:name).filled(:str?)
          required(:email).maybe(:str?)
          required(:first_name).maybe(:str?)
          required(:last_name).maybe(:str?)
          required(:photo).maybe(:str?)
          required(:preferences).array(:hash) do
            required(:category).filled(:str?)
            required(:config_key).filled(:str?)
            required(:payload).maybe(:hash)
            required(:resource_type).maybe(:str?)
            required(:resource_id).maybe(:int?)
          end
        end
      end
    end
  end
end

# rubocop:enable Metrics/AbcSize
# rubocop:enable Metrics/BlockLength
