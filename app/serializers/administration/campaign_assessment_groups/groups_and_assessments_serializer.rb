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
          CampaignAssessmentGroups::CampaignAssessmentSerializer.new(
            g,
            { current_user: current_user, project_id: g.campaign.project_id, campaign_id: g.campaign.id }
          ).to_h
        end
      end

      private

      def current_user
        instance_options[:current_user]
      end
    end
  end
end
