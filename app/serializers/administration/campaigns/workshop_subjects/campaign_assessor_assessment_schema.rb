# frozen_string_literal: true

module Administration
  module Campaigns
    module WorkshopSubjects
      class CampaignAssessorAssessmentSchema < BaseSchema
        def self.schema(_, _)
          Dry::Schema.JSON do
            config.validate_keys = true

            required(:id).filled(:int?)
            required(:name).filled(:str?)
            required(:assessment_id).filled(:int?)
            required(:linked_activity_id).maybe(:str?)
            required(:linked_activity_name).maybe(:str?)
          end
        end
      end
    end
  end
end
