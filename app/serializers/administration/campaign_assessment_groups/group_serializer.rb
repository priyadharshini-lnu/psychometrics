# frozen_string_literal: true

module Administration
  module CampaignAssessmentGroups
    class GroupSerializer < Panko::Serializer
      attributes :id, :name, :position, :previous_group_required, :previous_assessments_required,
                 :campaign_id, :campaign_assessment_ids, :group_type, :require_previous_groups_completion_for_booking

      def campaign_assessment_ids
        object.campaign_assessments.map(&:id)
      end

      def previous_group_required
        object.previous_group_required?
      end

      def previous_assessments_required
        object.previous_assessments_required?
      end

      def require_previous_groups_completion_for_booking
        object.require_previous_groups_completion_for_booking?
      end
    end
  end
end
