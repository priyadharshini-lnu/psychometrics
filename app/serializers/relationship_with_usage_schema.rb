# frozen_string_literal: true

class RelationshipWithUsageSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:id).filled(:int?)
      required(:type).filled(:str?)
      required(:name).maybe(:str?)
      required(:assign_type).filled(:str?)
      required(:usage).value { int? | float? | nil? }
    end
  end
end
