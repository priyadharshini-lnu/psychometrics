# frozen_string_literal: true

module Administration
  class SimulationUserAssessmentSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:time_extension).maybe(:int?)
        required(:content_variation_id).maybe(:str?)
        required(:participant_id).maybe(:str?)
      end
    end
  end
end
