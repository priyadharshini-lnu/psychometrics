# frozen_string_literal: true

module Api
  class V2::Administration::MaintenanceSettingsController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction
    validate_crud_requests Api::V2::MaintenanceSetting::Schema
    validates_request_schema :create, :create_request_contract_and_schema
    validates_request_schema :update, :update_request_contract_and_schema

    def create_request_contract_and_schema
      Api::V2::MaintenanceSetting::Contract.new(
        schema: Api::V2::MaintenanceSetting::Schema.create_request
      )
    end

    def update_request_contract_and_schema
      Api::V2::MaintenanceSetting::Contract.new(
        schema: Api::V2::MaintenanceSetting::Schema.update_request
      )
    end

    private

    def pundit_authorize
      authorize(
        nil,
        nil,
        policy_class: Api::Administration::MaintenanceSettingPolicy
      )
    end
  end
end
