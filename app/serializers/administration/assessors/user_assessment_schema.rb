# frozen_string_literal: true

module Administration
  module Assessors
    class UserAssessmentSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).filled(:int?)
          required(:assessment_name).filled(:str?)
          required(:status).filled(:str?)
        end
      end
    end
  end
end
