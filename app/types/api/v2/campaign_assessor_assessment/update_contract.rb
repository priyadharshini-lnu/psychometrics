# frozen_string_literal: true

module Api
  module V2
    module CampaignAssessorAssessment
      class UpdateContract < Api::Base::Contract
        config.messages.namespace = :assessor_assessment
        schema Api::V2::CampaignAssessorAssessment::Schema.update_request
      end
    end
  end
end
