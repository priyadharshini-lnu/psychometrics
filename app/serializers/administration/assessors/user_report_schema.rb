# frozen_string_literal: true

module Administration
  module Assessors
    class UserReportSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).filled(:int?)
          required(:name).filled(:str?)
          required(:internal).filled(:bool?)
          required(:status).filled(:str?)
          required(:report_url).maybe(:str?)
        end
      end
    end
  end
end
