# frozen_string_literal: true

module Administration
  class UserReportSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:permissions).hash do
          required(:view_report).filled(:bool?)
          required(:download_report).filled(:bool?)
          required(:remove).filled(:bool?)
          required(:toggle_access).filled(:bool?)
          required(:push_webhook).filled(:bool?)
        end
        required(:report_id).filled(:int?)
        required(:name).filled(:str?)
        required(:user_access).filled(:bool?)
        required(:report_family_name).maybe(:str?)
        required(:status).filled(:str?)
        required(:internal).filled(:bool?)
        required(:report_url).maybe(:str?)
      end
    end
  end
end
