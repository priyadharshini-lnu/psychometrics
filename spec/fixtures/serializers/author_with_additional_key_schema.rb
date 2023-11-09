# frozen_string_literal: true

module Dummy
  class AuthorWithAdditionalKeySchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:integer)
      end
    end
  end
end
