# frozen_string_literal: true

module EndUser
  class ReflectionQuestionSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:integer)
        required(:question).filled(:string)
        required(:answer).maybe(:string)
        required(:mandatory).filled(:bool)
        optional(:min_words).maybe(:integer)
        optional(:max_words).maybe(:integer)
      end
    end
  end
end
