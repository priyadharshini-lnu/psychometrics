# frozen_string_literal: true

module EndUser
  class UserReportSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = false

        required(:id).filled(:int?)
        required(:report_name).filled(:str?)
        required(:status).filled(:str?)
        required(:user_access).filled(:bool?)
        required(:user_id).filled(:int?)
        required(:pdf_url).maybe(:str?)
        required(:require_approval).filled(:bool?)
        required(:poster_url).maybe(:str?)
        required(:pdf_urls).maybe(:hash?)
      end
    end
  end
end
