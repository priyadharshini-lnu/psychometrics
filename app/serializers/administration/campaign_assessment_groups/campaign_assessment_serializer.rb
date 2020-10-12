# frozen_string_literal: true

module Administration
  module CampaignAssessmentGroups
    class CampaignAssessmentSerializer < ActiveModel::Serializer
      attributes :id, :name, :position, :campaign_id, :assessment_id, :campaign_assessment_group_id
      delegate :name, to: :assessment

      def assessment_id
        assessment.id
      end

      private

      def assessment
        object.assessment
      end
    end
  end
end
