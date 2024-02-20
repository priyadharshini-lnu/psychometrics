# frozen_string_literal: true

module Administration
  module Campaigns
    module Assessors
      class UserAssessmentSchema < BaseSchema
        def self.schema(_, _)
          Dry::Schema.JSON do
            config.validate_keys = true

            required(:id).filled(:int?)
            required(:assessment_name).filled(:str?)
            required(:subject_name).filled(:str?)
            required(:subject_email).filled(:str?)
            required(:status).filled(:str?)
            required(:permissions).hash do
              required(:reset_evaluation).filled(:bool?)
            end
          end
        end
      end
    end
  end
end
