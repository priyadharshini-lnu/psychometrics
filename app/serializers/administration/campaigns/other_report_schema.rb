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
        end
      end
    end
  end
end
