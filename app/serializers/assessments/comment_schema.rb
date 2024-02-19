# frozen_string_literal: true

module Assessments
  class CommentSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:text).filled(:str?)
        required(:created_by).filled(:str?)
        required(:created_at).filled(:str?)
        required(:author).filled(:str?)
      end
    end
  end
end
