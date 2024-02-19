# frozen_string_literal: true

class QuestionFieldSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:id).filled(:str?)
      required(:name).filled(:str?)
      required(:required_validation).filled(:bool?)
    end
  end
end
