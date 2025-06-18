# frozen_string_literal: true

module Administration
  module Campaigns
    module WorkshopSubjects
      class AssessorUserAssessmentSchema < BaseSchema
        def self.schema(_, _)
          Dry::Schema.JSON do
            config.validate_keys = true

            required(:id).filled(:str?)
            required(:name).filled(:str?)
            required(:assessment_id).filled(:int?)
            required(:status).filled(:str?)
            required(:schedule_time).maybe(:str?)
            required(:meeting_link).maybe(:str?)
            required(:assessor).hash do
              required(:id).filled(:str?)
              required(:user_id).filled(:str?)
              required(:name).filled(:str?)
              required(:photo_url).maybe(:str?)
            end
            required(:meeting_type).maybe(:str?)
            required(:linked_activity_id).maybe(:str?)
            required(:linked_activity_name).maybe(:str?)
          end
        end
      end
    end
  end
end
