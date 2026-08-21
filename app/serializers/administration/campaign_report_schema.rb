# frozen_string_literal: true

module Administration
  class CampaignReportSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true
        CampaignReportSchema.define_core_fields(self)
        CampaignReportSchema.define_permissions_field(self)
        CampaignReportSchema.define_language_fields(self)
        CampaignReportSchema.define_optional_fields(self)
      end
    end

    def self.define_core_fields(schema)
      schema.required(:id).filled(:int?)
      schema.required(:report_id).filled(:int?)
      schema.required(:name).maybe(:str?)
      schema.required(:user_access).filled(:bool?)
      schema.required(:auto_assign).filled(:bool?)
      schema.required(:assessor_access).filled(:bool?)
      schema.required(:report_family_name).maybe(:str?)
      schema.required(:user_dashboard).filled(:bool?)
      schema.required(:main_report).filled(:bool?)
      schema.required(:internal).maybe(:bool?)
      schema.required(:custom_upload).maybe(:bool?)
    end

    def self.define_permissions_field(schema)
      schema.required(:permissions).hash do
        required(:export).filled(:bool?)
        required(:remove).filled(:bool?)
      end
    end

    def self.define_language_fields(schema)
      schema.required(:available_languages).maybe(:array?).each(:str?)
      schema.required(:report_locales).array(:str?)
      schema.required(:effective_default_language).maybe(:str?)
    end

    def self.define_optional_fields(schema)
      schema.required(:assessment_ids).maybe(:array?).each(:int?)
      schema.required(:report_provider).maybe(:str?)
      schema.required(:user_report_id).maybe(:int?)
      schema.required(:external_settings).maybe(:hash?)
      schema.required(:status).maybe(:str?)
      schema.required(:owner).maybe do
        hash do
          required(:id).filled(:int?)
          required(:name).filled(:str?)
        end
      end
      schema.required(:tenant_id).maybe(:int?)
    end
  end
end
