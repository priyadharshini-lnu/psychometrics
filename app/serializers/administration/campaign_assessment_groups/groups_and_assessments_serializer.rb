# frozen_string_literal: true

module Administration
  module CampaignAssessmentGroups
    class GroupsAndAssessmentsSerializer < ActiveModel::Serializer
      attributes :groups, :assessments

      def groups
        object.campaign_assessment_groups.map { |g| CampaignAssessmentGroups::GroupSerializer.new(g).to_h }
      end

      def assessments
        object.campaign_assessments.map do |g|
          CampaignAssessmentSerializer.new(g, { project_id: g.campaign.project_id }).to_h
        end
      end
    end
  end
end
