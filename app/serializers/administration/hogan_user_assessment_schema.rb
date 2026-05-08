# frozen_string_literal: true

module Administration
  class HoganUserAssessmentSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:form_id).maybe(:str?)
        required(:assessment_id).maybe(:str?)
      end
    end
  end
end
