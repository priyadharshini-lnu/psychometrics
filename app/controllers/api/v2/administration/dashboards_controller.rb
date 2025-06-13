# frozen_string_literal: true

module Api
  class V2::Administration::DashboardsController < Api::V2::Administration::BaseController
    validates_request_schema :update, -> { Api::V2::Dashboard::UpdateContract.new }
    validate_crud_requests Api::V2::Dashboard::Schema

    def upload_image
      if dashboard.update(image_upload_params)
        render json: { image: dashboard.image&.url }
      else
        render json: { errors: dashboard.errors.messages }, status: 400
      end
    end

    def refresh
      Dashboards::RefreshData.call(dashboard) do
        on(:ok) { head :ok }
        on(:error) do |message|
          render json: { errors: message }, status: 422
        end
      end
    end

    def powerbi_capacities
      capacities = PowerBi::GetCapacities.call!.filter_map do |c|
        next unless c['sku'].starts_with?('A')

        { id: c['id'], name: c['displayName'] }
      end

      render json: capacities
    end

    def context
      super.merge(
        embed_token: params.dig(:query, :embed_token)
      )
    end

    private

    def context_for_schema_validation
      super.merge(dashboard: dashboard)
    end

    def dashboard
      @dashboard ||= Api::Administration::DashboardPolicy::Scope.new(
        current_user, Dashboard
      ).resolve.find(dashboard_id)
    end

    def dashboard_id
      params[:dashboard_id] || params[:id]
    end

    def image_upload_params
      params.permit(:image, :purge_image)
    end
  end
end
