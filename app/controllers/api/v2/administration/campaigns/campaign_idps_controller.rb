# frozen_string_literal: true

module Api
  class V2::Administration::Campaigns::CampaignIdpsController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::CampaignIdp::Schema
    validates_request_schema :update, :update_request_contract_and_schema
    validates_request_schema :create, :create_request_contract_and_schema
    around_action :create_assigninging_job, only: %i[create update]

    def create_request_contract_and_schema
      Api::V2::CampaignIdp::Contract.new(
        schema: Api::V2::CampaignIdp::Schema.create_request
      )
    end

    def update_request_contract_and_schema
      Api::V2::CampaignIdp::Contract.new(
        schema: Api::V2::CampaignIdp::Schema.update_request
      )
    end

    def create_assigninging_job
      override_exists = params[:data][:attributes]&.delete(:override_exists)
      yield
      if override_exists
        AdminJob.call(:assign_idp_to_users,
                      { campaign_id: campaign.id, idp_template_id: resource.idp_template_id },
                      current_user)
      end
    end

    def policy_class
      @policy_class ||= Api::Administration::Campaigns::CampaignIdpPolicy
    end

    def resource
      @resource ||= policy_class::Scope.new(
        current_user, CampaignIdp, campaign_id: campaign.id
      ).resolve.first
    end
  end
end
