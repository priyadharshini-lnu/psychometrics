# frozen_string_literal: true

module Api
  class V2::Administration::Campaigns::CampaignIdpsController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::CampaignIdp::Schema

    around_action :create_assigninging_job, only: %i[create update]

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
