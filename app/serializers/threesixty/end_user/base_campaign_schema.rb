# frozen_string_literal: true

module Threesixty
  module EndUser
    class BaseCampaignSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true
        end
      end
    end
  end
end
