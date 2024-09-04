# frozen_string_literal: true

class FactorsSubFactorSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:id).filled(:int?)
      required(:weight).value { int? | float? | nil? }
      required(:name).filled(:str?)
      required(:sub_factor_id).filled(:int?)
      required(:predicate).maybe(:str?)
      required(:value).value { int? | float? | nil? }
      required(:position).maybe(:int?)
    end
  end
end
