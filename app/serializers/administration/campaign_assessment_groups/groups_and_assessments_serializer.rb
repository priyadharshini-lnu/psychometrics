# frozen_string_literal: true

module Administration
  module CampaignAssessmentGroups
    class GroupsAndAssessmentsSerializer < ActiveModel::Serializer
      attributes :groups, :assessments

      def groups
        object.campaign_assessment_groups.map { |g| CampaignAssessmentGroups::GroupSerializer.new(g).to_h }
      end

      def assessments
        object.campaign_assessments.map { |g| CampaignAssessmentSerializer.new(g).to_h }
      end
    end
  end
end
