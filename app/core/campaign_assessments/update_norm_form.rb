# frozen_string_literal: true

module CampaignAssessments
  class UpdateNormForm < Rectify::Form
    attribute :norm_id, Integer
    attribute :norm_type, String, default: :default_norm_type

    validates :norm_type, inclusion: { in: %w[eti yti percentile] }

    def default_norm_type
      norm = Norm.find(norm_id)
      norm.norm_type
    end
  end
end
