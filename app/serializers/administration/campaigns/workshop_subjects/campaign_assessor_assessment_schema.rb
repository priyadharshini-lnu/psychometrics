# frozen_string_literal: true

module Administration
  module Campaigns
    module WorkshopSubjects
      class CampaignAssessorAssessmentSchema < BaseSchema
        def self.schema(_, _)
          Dry::Schema.JSON do
            config.validate_keys = true

            required(:id).filled(:str?)
            required(:name).filled(:str?)
            required(:assessor_user_assessment_id).filled(:int?)
            required(:status).filled(:str?)
            required(:schedule_time).maybe(:int?)
            required(:meeting_link).maybe(:str?)
            required(:linked_activity).maybe(:str?)
            required(:assessor).hash do
              required(:id).filled(:str?)
              required(:name).filled(:str?)
              required(:photo_url).maybe(:str?)
            end
            required(:subject_linked_activity_present).filled(:bool?)
            required(:meeting_type).filled(:str?)
          end
        end
      end
    end
  end
end
