# frozen_string_literal: true

module Threesixty
  class CampaignOptionsSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = false

        required(:participants).maybe(:hash?)
        required(:reports).maybe(:hash?)
        required(:messages).maybe(:hash?)
      end
    end
  end
end
