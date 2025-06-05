# frozen_string_literal: true

module Administration
  module CampaignAssessmentGroups
    class CampaignAssessmentSerializer < Panko::Serializer
      attributes :id, :name, :position, :campaign_id, :assessment_id, :campaign_assessment_group_id,
                 :workshop_activity_duration
      delegate :name, to: :assessment

      delegate :id, to: :assessment, prefix: true

      private

      def assessment
        object.assessment
      end
    end
  end
end
