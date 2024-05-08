# frozen_string_literal: true

module Administration
  module Campaigns
    class TemplateSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).filled(:int?)
          required(:name).filled(:str?)
          required(:assessment_id).maybe(:int?)
        end
      end
    end
  end
end
