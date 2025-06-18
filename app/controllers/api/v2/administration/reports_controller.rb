# frozen_string_literal: true

module Api
  class V2::Administration::ReportsController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::ReportApprovalSetting::Schema
    validates_request_schema :create, :create_contract_based_on_provider
    validates_request_schema :update, :update_contract_based_on_provider
    validates_request_schema :copy, -> { Api::V2::Report::CopyContract.new }
    include Api::V2::Administration::Concerns::Taggable

    INTEGRATIONS_CONTRACTS = {
      'hogan' => Api::V2::Report::HoganContract,
      'saville' => Api::V2::Report::SavilleContract
    }.freeze

    def create_contract_based_on_provider
      integration_contract = INTEGRATIONS_CONTRACTS[params[:data][:attributes][:provider]] ||
                             Api::V2::Report::CommonContract

      integration_contract.new(schema: Api::V2::Report::Schema.create_request)
    end

    def update_contract_based_on_provider
      integration_contract = INTEGRATIONS_CONTRACTS[params[:data][:attributes][:provider]] ||
                             Api::V2::Report::CommonContract
      integration_contract.new(schema: Api::V2::Report::Schema.update_request)
    end

    def copy
      result = ::Reports::CopyReport.call!(
        resource.id, current_user,
        params.dig(:data, :relationships, :owner, :data, :id),
        new_report_name: params.dig(:data, :attributes, :name)
      )
      jsonapi_render json: result
    end

    def restore
      audit! :restore, resource, payload: { source_id: resource.id }
      resource.restore!
      jsonapi_render json: resource
    end

    private

    def resource
      @resource ||= Api::Administration::ReportPolicy::Scope.new(
        current_user, Report
      ).resolve.find(params[:report_id])
    end
  end
end
