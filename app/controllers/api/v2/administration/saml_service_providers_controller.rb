# frozen_string_literal: true

module Api
  class V2::Administration::SamlServiceProvidersController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::SamlServiceProvider::Schema
    validates_request_schema :update, :update_request_contract_and_schema
    validates_request_schema :create, :create_request_contract_and_schema

    def update_request_contract_and_schema
      Api::V2::SamlServiceProvider::Contract.new(
        schema: Api::V2::SamlServiceProvider::Schema.update_request
      )
    end

    def create_request_contract_and_schema
      Api::V2::SamlServiceProvider::Contract.new(
        schema: Api::V2::SamlServiceProvider::Schema.create_request
      )
    end

    def policy_class
      Api::Administration::SamlServiceProviderPolicy
    end

    def rotate_certificate
      saml_service_provider = SamlServiceProvider.find(params[:id])
      authorize saml_service_provider, :rotate_certificate?

      saml_service_provider.rotate_certificate!

      audit!(:rotate_certificate, saml_service_provider, project: saml_service_provider.project)

      jsonapi_render json: saml_service_provider, options: {
        resource: Api::V2::Administration::SamlServiceProviderResource
      }
    end

    def context
      super.merge(
        project_id: params[:project_id]
      )
    end
  end
end
