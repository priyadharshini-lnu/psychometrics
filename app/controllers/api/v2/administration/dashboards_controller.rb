# frozen_string_literal: true

module Api
  class V2::Administration::DashboardsController < Api::V2::Administration::BaseController
    validates_request_schema :update, Api::V2::Dashboard::UpdateContract.new
    validate_crud_requests Api::V2::Dashboard::Schema

    def upload_image
      authorize Dashboard, :update?, policy_class: ::Api::Administration::DashboardPolicy
      if dashboard.update(image_upload_params)
        render json: { image: dashboard.image&.url }
      else
        render json: { errors: dashboard.errors.messages }, status: 400
      end
    end

    def refresh
      authorize Dashboard, :update?, policy_class: ::Api::Administration::DashboardPolicy
      Dashboards::RefreshData.call(dashboard) do
        on(:ok) { head :ok }
        on(:error) do |message|
          render json: { errors: message }, status: 422
        end
      end
    end

    def context
      super.merge(
        embed_token: params.dig(:query, :embed_token)
      )
    end

    private

    def dashboard
      @dashboard ||= Api::Administration::DashboardPolicy::Scope.new(
        current_user, Dashboard
      ).resolve.find(params[:dashboard_id])
    end

    def image_upload_params
      params.permit(:image, :remove_image)
    end
  end
end
