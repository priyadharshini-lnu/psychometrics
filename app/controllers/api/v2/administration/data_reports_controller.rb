# frozen_string_literal: true

module Api
  class V2::Administration::DataReportsController < Api::V2::Administration::BaseController
    validates_request_schema :create,
                             lambda {
                               Api::V2::DataReport::Contract.new(schema: Api::V2::DataReport::Schema.create_request)
                             }
    validates_request_schema :update,
                             lambda {
                               Api::V2::DataReport::Contract.new(schema: Api::V2::DataReport::Schema.update_request)
                             }

    def run
      AdminJob.call(:data_report_export, { data_report_id: model.id, client_id: model.owner_id }, current_user)

      render json: :ok
    end

    def pundit_authorize
      authorize(
        model,
        nil,
        policy_class: Api::Administration::DataReportPolicy,
        project_id: model&.owner_id || params.dig(:filter, :owner_id_eq)
      )
    end
  end
end
