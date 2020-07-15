# frozen_string_literal: true

module Administration
  class CampaignAssessmentSerializer < ActiveModel::Serializer
    attributes :id, :assessment_id, :name, :category, :norm_name, :enable_universal_links

    delegate :id, :name, :category, to: :assessment
    delegate :name, to: :norm, prefix: true, allow_nil: true

    private

    def norm
      object.norm
    end

    def assessment
      object.assessment
    end
  end
end
