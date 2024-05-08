# frozen_string_literal: true

class HighlightSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = false

      required(:id).filled(:int?)
      required(:resource_id).filled(:int?)
      required(:resource_type).filled(:str?)
      required(:data).filled(:array?)
    end
  end
end
