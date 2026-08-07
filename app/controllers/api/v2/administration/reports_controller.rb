# frozen_string_literal: true

module Api
  class V2::Administration::ReportsController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction
    validate_crud_requests Api::V2::Report::Schema
    validates_request_schema :create, :create_contract_based_on_provider
    validates_request_schema :update, :update_contract_based_on_provider
    validates_request_schema :copy, -> { Api::V2::Report::CopyContract.new }
    include Api::V2::Administration::Concerns::Taggable

    INTEGRATIONS_CONTRACTS = {
      'hogan' => Api::V2::Report::HoganContract,
      'saville' => Api::V2::Report::SavilleContract,
      'mhs' => Api::V2::Report::MhsContract
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
      new_name = params.dig(:data, :attributes, :name)
      owner_id = params.dig(:data, :relationships, :owner, :data, :id)
      audit! :copy, resource,
             payload: { source_id: resource.id, new_name: new_name, owner_id: owner_id }
      AdminJob.call(
        :copy_report,
        {
          report_id: resource.id,
          owner_id: owner_id,
          name: new_name,
          skip_owner_validation: true
        },
        current_user
      )
      render json: :ok
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
