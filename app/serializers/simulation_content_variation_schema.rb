# frozen_string_literal: true

class SimulationContentVariationSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:id) { int? | str? }
      required(:name).filled(:str?)
    end
  end
end
