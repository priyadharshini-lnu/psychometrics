# frozen_string_literal: true

module Dummy
  class CommentSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:integer)
        required(:text).filled(:string)
      end
    end
  end
end
