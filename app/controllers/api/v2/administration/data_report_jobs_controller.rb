# frozen_string_literal: true

module Api
  class V2::Administration::DataReportJobsController < Api::V2::Administration::BaseController
    validate_crud_requests ::Api::V2::DataReportJob::Schema

    def get_password
      render json: { password: model.password }
    end

    def pundit_authorize
      data_report = DataReport.find(params[:data_report_id] || params[:id])

      authorize(
        data_report,
        nil,
        policy_class: Api::Administration::DataReportJobPolicy,
        project_id: data_report&.owner_id
      )
    end
  end
end
