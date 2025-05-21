# frozen_string_literal: true

module Administration
  class PearsonUserAssessmentSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:schedule_id).maybe(:str?)
        required(:norm_id).maybe(:str?)
      end
    end
  end
end
