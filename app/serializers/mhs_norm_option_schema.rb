# frozen_string_literal: true

class MhsNormOptionSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:label).filled(:str?)
      required(:value).filled(:str?)
    end
  end
end
