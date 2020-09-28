# frozen_string_literal: true

module Administration
  module CampaignAssessmentGroups
    class GroupsAndAssessmentsSerializer < ActiveModel::Serializer
      attributes :groups, :assessments

      def groups
        object.campaign_assessment_groups.map { |g| CampaignAssessmentGroups::GroupSerializer.new(g) }
      end

      def assessments
        object.campaign_assessments.map { |g| CampaignAssessmentSerializer.new(g) }
      end
    end
  end
end
