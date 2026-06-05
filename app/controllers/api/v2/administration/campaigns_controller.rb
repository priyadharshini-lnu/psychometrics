# frozen_string_literal: true

module Api
  class V2::Administration::CampaignsController < Api::V2::Administration::BaseController
    include Api::V2::Administration::Concerns::Taggable

    validate_crud_requests Api::V2::Campaign::Schema

    before_action :load_campaign, only: [:all_assessments]

    def all_assessments
      search_query = params.dig(:filter, :filterable_fields)
      assessments = ::Campaigns::AllAssessmentsQuery.new(@campaign, search_query, params[:page],
                                                         params[:page_size]).query
      render json: jsonapi_format(assessments.to_a, resource: Api::V2::Administration::AssessmentResource)
    end

    private

    def resource
      @resource ||= Api::Administration::CampaignPolicy::Scope.new(
        current_user, Campaign
      ).resolve.find(params[:campaign_id])
    end

    # This is needed for member routes that use :id instead of :campaign_id
    def load_campaign
      scope = Api::Administration::CampaignPolicy::Scope.new(
        current_user,
        Campaign
      ).resolve

      @campaign = scope.find(params[:id])
    end
  end
end
