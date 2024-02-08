# frozen_string_literal: true

module Administration
  module CampaignAssessmentGroups
    class GroupsAndAssessmentsSerializer < Panko::Serializer
      attributes :groups, :assessments

      def groups
        object.campaign_assessment_groups.map { |g| CampaignAssessmentGroups::GroupSerializer.new.serialize(g) }
      end

      def assessments
        object.campaign_assessments.map do |g|
          CampaignAssessmentGroups::CampaignAssessmentSerializer.new(
            context: { current_user: current_user, project_id: g.campaign.project_id, campaign_id: g.campaign.id }
          ).serialize(g)
        end
      end

      private

      def current_user
        context[:current_user]
      end
    end
  end
end
