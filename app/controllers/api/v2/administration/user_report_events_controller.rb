# frozen_string_literal: true

module Api
  class V2::Administration::UserReportEventsController < V2::Administration::BaseController
    def export
      AdminJob.call(
        :export_user_report_events,
        export_params,
        current_user
      )
      audit! :export, nil, payload: params, record_type: UserReportEvent

      render json: :ok
    end

    private

    def export_params
      params.permit(:client_id, :project_id, :campaign_id, :start_date, :end_date)
    end
  end
end
