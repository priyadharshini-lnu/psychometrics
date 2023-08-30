# frozen_string_literal: true

module Api
  class V2::Administration::WorkshopResourcesController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::WorkshopResource::Schema
    validates_request_schema :create, :create_request_contract_and_schema
    validates_request_schema :update, :update_request_contract_and_schema

    def create_request_contract_and_schema
      Api::V2::WorkshopResource::Contract.new(
        schema: Api::V2::WorkshopResource::Schema.create_request
      )
    end

    def update_request_contract_and_schema
      Api::V2::WorkshopResource::Contract.new(
        schema: Api::V2::WorkshopResource::Schema.update_request
      )
    end

    private

    def meta_details
      {
        permissions: lambda {
          GetPermissionsHash.call!(
            Administration::WorkshopResourcePolicy,
            context[:user],
            @model,
            [
              'index',
              'create',
              %w[edit update],
              %w[remove destroy]
            ],
            { campaign_id: campaign_id }
          )
        }
      }
    end
  end
end
