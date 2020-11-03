# frozen_string_literal: true

module Administration
  module CampaignAssessmentGroups
    class GroupSerializer < ActiveModel::Serializer
      attributes :id, :name, :position, :previous_group_required, :previous_assessments_required,
                 :campaign_id, :campaign_assessment_ids

      def campaign_assessment_ids
        object.campaign_assessments.map(&:id)
      end
    end
  end
end
