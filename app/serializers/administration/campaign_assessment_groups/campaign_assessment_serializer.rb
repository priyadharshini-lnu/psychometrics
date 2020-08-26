# frozen_string_literal: true

module Administration
  module CampaignAssessmentGroups
    class CampaignAssessmentSerializer < ActiveModel::Serializer
      attributes :id, :name, :position
      delegate :id, :name, to: :assessment

      def assessment
        object.assessment
      end
    end
  end
end
