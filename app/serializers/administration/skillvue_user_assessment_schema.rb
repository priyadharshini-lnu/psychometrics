# frozen_string_literal: true

module Administration
  class SkillvueUserAssessmentSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:email).maybe(:str?)
        required(:external_assessment_id).filled(:str?)
        required(:external_user_id).maybe(:str?)
      end
    end
  end
end
