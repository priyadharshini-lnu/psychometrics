# frozen_string_literal: true

class RelationshipWithUsageSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:id).filled(:str?)
      required(:type).filled(:str?)
      required(:name).filled(:str?)
      required(:assign_type).filled(:str?)
      required(:usage).value { int? | float? | nil? }
    end
  end
end
