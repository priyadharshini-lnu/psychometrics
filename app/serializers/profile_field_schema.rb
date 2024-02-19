# frozen_string_literal: true

class ProfileFieldSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = false

      required(:required).filled(:bool?)
      required(:half_size).filled(:bool?)
      required(:position).filled(:int?)
      required(:name).filled(:str?)
      required(:question_id).filled(:int?)
      required(:question).hash do
        required(:type).filled(:str?)
        required(:props).filled(:hash?)
      end
      required(:locked).filled(:bool?)
      required(:translations).filled(:hash?)
    end
  end
end
