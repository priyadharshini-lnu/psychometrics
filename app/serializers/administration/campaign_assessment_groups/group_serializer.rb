# frozen_string_literal: true

module Administration
  module CampaignAssessmentGroups
    class GroupSerializer < ActiveModel::Serializer
      attributes :id, :name, :position, :previous_group_required, :previous_assessments_required,
                 :assessments, :campaign_id

      def assessments
        object.campaign_assessments.map { |ca| CampaignAssessmentSerializer.new(ca) }
      end
    end
  end
end
