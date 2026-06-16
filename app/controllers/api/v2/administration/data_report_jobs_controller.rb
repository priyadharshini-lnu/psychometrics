# frozen_string_literal: true

module Api
  class V2::Administration::DataReportJobsController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction
    validate_crud_requests ::Api::V2::DataReportJob::Schema

    def get_password
      render json: { password: model.password }
    end

    def model
      @model ||= policy_class::Scope.new(
        current_user, model_class,
        filter: { client_id: params.dig(:filter, :data_report_owner_id_eq) }
      ).resolve.find(model_id)
    end

    def pundit_authorize
      data_report = DataReport.find(params[:data_report_id] || params[:id])
      authorize(
        data_report,
        nil,
        policy_class: Api::Administration::DataReportJobPolicy,
        project_id: data_report&.owner_id,
        filter: { client_id: params.dig(:filter, :data_report_owner_id_eq) }
      )
    end
  end
end
