# frozen_string_literal: true

module Administration
  class ExternalUserReportSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:report_name).filled(:str?)
        required(:user_id).filled(:int?)
        required(:user_email).filled(:str?)
        required(:pdf_url).filled(:str?)
        required(:can_download_report).filled(:bool?)
      end
    end
  end
end
