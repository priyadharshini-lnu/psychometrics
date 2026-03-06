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
      required(:ai_scoring_config).hash do
        optional(:what_to_look_for).maybe(:str?)
        optional(:score_definitions).array do
          hash do
            required(:score).value(:str?)
            required(:definition).value(:str?)
          end
        end
      end
    end
  end
end
