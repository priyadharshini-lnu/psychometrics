# frozen_string_literal: true

module Threesixty
  class EmailHistorySchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:status).filled(:str?)
        required(:created_at).filled(:str?)
      end
    end
  end
end
