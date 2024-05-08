# frozen_string_literal: true

class OccupationsFactorSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:id).filled(:int?)
      required(:predicate).filled(:str?)
      required(:value).value { int? | float? | nil? }
      required(:position).maybe(:int?)
      required(:weight).value { int? | float? | nil? }
    end
  end
end
