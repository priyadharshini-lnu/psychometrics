# frozen_string_literal: true

class QuestionFieldSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:id).filled(:int?)
      required(:name).filled(:str?)
      required(:required_validation).maybe do
        hash do
          required(:enabled).filled(:bool?)
          optional(:type).maybe(:str?)
        end
      end
    end
  end
end
