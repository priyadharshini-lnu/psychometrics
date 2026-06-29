# frozen_string_literal: true

module Api
  class V2::Administration::UserReportEventsController < V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction, only: :export

    def export
      AdminJob.call(
        :export_user_report_events,
        export_params,
        current_user
      )
      audit! :export, nil, payload: params, record_type: UserReportEvent

      render json: :ok
    end

    def context
      super.merge(
        project_id: project_id,
        campaign_id: campaign_id
      )
    end

    def project_id
      params.dig(:query, :project_id) || params.dig(:query, :client_id)
    end

    def campaign_id
      params.dig(:query, :campaign_id)
    end

    private

    def export_params
      params.require(:data).require(:attributes).permit(:client_id, :project_id, :campaign_id, :start_date, :end_date)
    end

    def base_response_meta
      return {} if params[:action] != 'index'

      {
        permissions: GetPermissionsHash.call!(
          policy_class,
          context[:user],
          @model,
          [
            'export'
          ],
          {
            project_id: context[:project_id],
            campaign_id: context[:campaign_id]
          }
        )
      }
    end

    def enforce_geo_restriction
      client = if project_id
                 Client.find_by(id: project_id)&.client
               elsif campaign_id
                 Campaign.find_by(id: campaign_id)&.client
               end

      raise Geo::Exceptions::ClientNotFound unless client

      client.check_geo_restriction!
    end
  end
end
