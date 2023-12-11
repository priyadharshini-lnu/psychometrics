# frozen_string_literal: true

module Api
  module V2
    module CampaignAssessorAssessment
      class CreateContract < Api::Base::Contract
        config.messages.namespace = :assessor_assessment
        schema Api::V2::CampaignAssessorAssessment::Schema.create_request

        rule(data: { attributes: :assessment_id }) do
          campaign = _options[:result].context[:campaign]
          if ::Assessment.find(value).lead_assessor_form? && campaign.lead_assessor_assessment
            key.failure(:lead_already_added)
          end
        end

        rule(data: { attributes: :assessment_id }) do
          campaign_id = values.dig(:data, :attributes, :campaign_id)
          key.failure(:already_added) if ::CampaignAssessorAssessment.exists?(
            campaign_id: campaign_id, assessment_id: value
          )
        end
      end
    end
  end
end
