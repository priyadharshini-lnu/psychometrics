# frozen_string_literal: true

module Administration
  module CampaignAssessmentGroups
    class WithUngroupedAssessmentsSerializer < ActiveModel::Serializer
      attributes :groups, :ungrouped

      def groups
        object.campaign_assessment_groups.map { |g| GroupSerializer.new(g) }
      end

      def ungrouped
        object.campaign_assessments.
          where(campaign_assessment_group_id: nil).
          map { |g| CampaignAssessmentSerializer.new(g) }
      end
    end
  end
end
