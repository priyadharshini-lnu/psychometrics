# frozen_string_literal: true

class PearsonVariationSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:code).filled(:str?)
      required(:name).filled(:str?)
    end
  end
end
