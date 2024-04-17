# frozen_string_literal: true

module Administration
  class ShortAssessorAssessmentSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:name).filled(:str?)
        required(:status).filled(:str?)
        required(:completed_at).maybe(:str?)
        required(:assessment_id).filled(:int?)
        required(:linked_assessment_id).maybe(:int?)
        required(:allow_multiple_responses).maybe(:bool?)
      end
    end
  end
end
