# frozen_string_literal: true

module Administration
  module CampaignAssessmentGroups
    class GroupSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).filled(:int?)
          required(:name).filled(:str?)
          required(:position).filled(:int?)
          required(:previous_group_required).filled(:bool?)
          required(:previous_assessments_required).filled(:bool?)
          required(:campaign_id).filled(:int?)
          required(:campaign_assessment_ids).maybe(:array?)
          required(:group_type).filled(:str?)
        end
      end
    end
  end
end
