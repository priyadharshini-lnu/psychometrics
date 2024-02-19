# frozen_string_literal: true

module Threesixty
  class CampaignDetailsSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:options).filled(:hash?)
        required(:evaluators).filled(:hash?)
      end
    end
  end
end
