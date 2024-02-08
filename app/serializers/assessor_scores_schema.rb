# frozen_string_literal: true

class AssessorScoresSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = false

      required(:id).filled(:str?)
      required(:evaluator).hash do
        optional(:id).maybe(:str?)
        optional(:first_name).maybe(:str?)
        optional(:last_name).maybe(:str?)
        optional(:email).maybe(:str?)
      end
      required(:assessment).hash do
        optional(:id).maybe(:str?)
        optional(:name).maybe(:str?)
      end
      required(:scores).value { hash? }
    end
  end
end
