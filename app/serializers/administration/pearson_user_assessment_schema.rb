# frozen_string_literal: true

module Administration
  class PearsonUserAssessmentSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:schedule_id).maybe(:str?)
        required(:norm_id).maybe(:str?)
        required(:assessment_id).maybe(:int?)
        required(:product_id).maybe(:str?)
        required(:assessment_language).maybe(:str?)
        required(:error_details).maybe(:hash?)
      end
    end
  end
end
