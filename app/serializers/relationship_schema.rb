# frozen_string_literal: true

class RelationshipSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:id).value { str? | int? }
      optional(:type).filled(:str?)
      required(:name).maybe(:str?)
      optional(:assign_type).filled(:str?)
    end
  end
end
