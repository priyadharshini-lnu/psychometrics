# frozen_string_literal: true

module Api
  class V2::Administration::DashboardsController < Api::V2::Administration::BaseController
    validates_request_schema :update, Api::V2::Dashboard::UpdateContract.new
    validate_crud_requests Api::V2::Dashboard::Schema

    def upload_image
      dashboard = Api::Administration::DashboardPolicy::Scope.new(
        current_user, Dashboard
      ).resolve.find(params[:dashboard_id])
      if dashboard.update(image_upload_params)
        render json: { image: dashboard.image&.url }
      else
        render json: { errors: dashboard.errors.messages }, status: :bad_request
      end
    end

    def context
      super.merge(
        embed_token: params.dig(:query, :embed_token)
      )
    end

    private

    def image_upload_params
      params.permit(:image, :remove_image)
    end
  end
end
