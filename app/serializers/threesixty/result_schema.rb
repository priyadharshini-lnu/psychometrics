# frozen_string_literal: true

module Threesixty
  class ResultSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:subject_id).filled(:int?)
        required(:created_at).filled(:str?)
        required(:completed_at).filled(:str?)
        required(:hash).filled(:str?)
      end
    end
  end
end
