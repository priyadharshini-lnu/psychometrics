# frozen_string_literal: true

module Administration
  module Campaigns
    class OtherReportSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).filled(:int?)
          required(:name).filled(:str?)
          required(:permissions).hash do
            required(:export).filled(:bool?)
          end
          required(:owner).maybe do
            hash do
              required(:id).filled(:int?)
              required(:name).filled(:str?)
            end
          end
          required(:assessment_ids).maybe(:array?).each(:int?)
          required(:report_provider).maybe(:str?)
          required(:effective_default_language).maybe(:str?)
          required(:available_languages).maybe(:array?).each(:str?)
          required(:tenant_id).maybe(:int?)
        end
      end
    end
  end
end
