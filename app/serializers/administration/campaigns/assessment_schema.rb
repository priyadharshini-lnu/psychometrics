# frozen_string_literal: true

module Administration
  module Campaigns
    class AssessmentSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).filled(:int?)
          required(:name).filled(:str?)
          required(:icon_url).maybe(:str?)
          required(:icon_color).maybe(:str?)
        end
      end
    end
  end
end
