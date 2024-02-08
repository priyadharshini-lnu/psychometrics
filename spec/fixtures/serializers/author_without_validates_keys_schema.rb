# frozen_string_literal: true

module Dummy
  class AuthorWithoutValidatesKeysSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        required(:id).filled(:integer)
        required(:name).filled(:string)
      end
    end
  end
end
