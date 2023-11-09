# frozen_string_literal: true

module Dummy
  class PostSchema < BaseSchema
    def self.schema(response, serializer)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:integer)
        required(:title).filled(:string)
        required(:author).hash(AuthorSchema.schema(response[:author], serializer))
        required(:comments).array(CommentSchema.schema(response[:comments], serializer))
      end
    end
  end
end
