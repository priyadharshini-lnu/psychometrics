# frozen_string_literal: true

module Api
  class V2::Administration::ApplicationsController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction
    validate_crud_requests Api::V2::Application::Schema

    def activate
      application.update!(disabled: false, modified_by_id: current_user.id)
      audit! :activate, application, payload: { id: application.id, disabled: application.disabled },
        client: application.tenant
      jsonapi_render json: application
    end

    def deactivate
      application.update!(disabled: true, modified_by_id: current_user.id)
      audit! :deactivate, application, payload: { id: application.id, disabled: application.disabled },
        client: application.tenant
      jsonapi_render json: application
    end

    private

    def application
      @application ||= Users::Application.find(params[:id])
    end

    def model_class
      Users::Application
    end

    def policy_class
      Api::Administration::ApplicationPolicy
    end
  end
end
