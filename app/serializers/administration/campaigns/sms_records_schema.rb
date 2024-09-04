# frozen_string_literal: true

module Administration
  module Campaigns
    class SmsRecordsSchema < Panko::Serializer
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).filled(:int?)
          required(:message).filled(:str?)
        end
      end
    end
  end
end
