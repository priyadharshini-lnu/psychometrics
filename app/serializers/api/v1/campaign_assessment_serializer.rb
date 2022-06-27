# frozen_string_literal: true

module Api
  module V1
    class CampaignAssessmentSerializer < ActiveModel::Serializer
      attributes :id, :norm_id
    end
  end
end
