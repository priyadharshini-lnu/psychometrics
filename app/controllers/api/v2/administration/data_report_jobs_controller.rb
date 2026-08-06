# frozen_string_literal: true

module Api
  class V2::Administration::DataReportJobsController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction
    validate_crud_requests ::Api::V2::DataReportJob::Schema

    def get_password
      render json: { password: model.password }
    end

    def download
      audit!(
        'download',
        model.data_report,
        user: current_user,
        payload: {
          data_report_job_id: model.id,
          data_report_id: model.data_report_id
        }
      )

      redirect_to model.file.url
    end

    def model
      data_report = DataReport.find(params[:data_report_id])

      client_id = data_report.scope_client? ? data_report&.owner_id : nil

      @model ||= policy_class::Scope.new(
        current_user,
        model_class,
        filter: { client_id: client_id }
      ).resolve.find(model_id)
    end

    def pundit_authorize
      data_report = DataReport.find(params[:data_report_id])

      client_id = data_report.scope_client? ? data_report&.owner_id : nil

      authorize(
        data_report,
        nil,
        policy_class: Api::Administration::DataReportJobPolicy,
        project_id: data_report&.owner_id,
        filter: { client_id: client_id }
      )
    end
  end
end
