# frozen_string_literal: true

module Administration
  module CampaignAssessmentGroups
    class GroupSerializer < ActiveModel::Serializer
      attributes :id, :name, :position, :previous_group_required, :previous_assessments_required,
                 :campaign_id, :campaign_assessment_ids, :group_type

      def campaign_assessment_ids
        object.campaign_assessments.map(&:id)
      end

      def previous_group_required
        object.previous_group_required == true
      end

      def previous_assessments_required
        object.previous_assessments_required == true
      end
    end
  end
end
