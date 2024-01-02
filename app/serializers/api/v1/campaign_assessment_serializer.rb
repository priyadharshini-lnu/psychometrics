# frozen_string_literal: true

module Api
  module V1
    class CampaignAssessmentSerializer < Panko::Serializer
      attributes :id, :norm_id
    end
  end
end
