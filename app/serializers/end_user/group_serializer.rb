# frozen_string_literal: true

module EndUser
  class GroupSerializer < Panko::Serializer
    attributes :id, :name, :position, :previous_group_required, :previous_assessments_required,
               :campaign_id, :campaign_assessment_ids, :group_type

    def campaign_assessment_ids
      object.campaign_assessments.sort_by(&:position).map(&:assessment_id)
    end
  end
end
