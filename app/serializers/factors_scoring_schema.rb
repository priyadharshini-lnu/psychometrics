# frozen_string_literal: true

class FactorsScoringSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:id).filled(:int?)
      required(:props).array do
        hash do
          required(:index).value { int? | float? | nil? }
          required(:value).value { int? | float? | nil? }
        end
      end
      required(:question_id).filled(:str?)
    end
  end
end
