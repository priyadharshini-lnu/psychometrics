# frozen_string_literal: true

module Api
  class V2::Administration::CampaignScoringVariablesController < Api::V2::Administration::BaseController
    validates_request_schema :update, Api::V2::CampaignScoringVariable::Contract.new

    def index
      render json: {
        data: [{
          type: 'campaign_scoring_variables',
          id: campaign.campaign_options.id.to_s,
          attributes: { variables: campaign.campaign_options.campaign_scoring_variables }
        }]
      }
    end

    def update
      campaign.campaign_options.update!(campaign_scoring_variables: params[:data][:attributes][:variables])

      render json: json_api_attributes(campaign.campaign_options,
                                       variables: campaign.campaign_options.campaign_scoring_variables)
    end

    def policy_class
      @policy_class ||= Api::Administration::CampaignScoringVariablePolicy
    end
  end
end
