# frozen_string_literal: true

module Administration
  module CampaignAssessmentGroups
    class CampaignAssessmentSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).filled(:int?)
          required(:name).filled(:str?)
          required(:position).filled(:int?)
          required(:campaign_id).filled(:int?)
          required(:assessment_id).filled(:int?)
          required(:campaign_assessment_group_id).maybe(:int?)
          required(:workshop_activity_duration).maybe(:int?)
        end
      end
    end
  end
end
