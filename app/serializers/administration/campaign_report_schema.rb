# frozen_string_literal: true

module Administration
  class CampaignReportSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:report_id).filled(:int?)
        required(:name).filled(:str?)
        required(:user_access).filled(:bool?)
        required(:auto_assign).filled(:bool?)
        required(:assessor_access).filled(:bool?)
        required(:report_family_name).filled(:str?)
        required(:permissions).hash do
          required(:export).filled(:bool?)
          required(:remove).filled(:bool?)
        end
        required(:user_dashboard).filled(:bool?)
        required(:main_report).filled(:bool?)
        required(:default_language).maybe(:str?)
        required(:available_languages).maybe(:array?).each(:str?)
        required(:report_locales).array(:str?)
      end
    end
  end
end
