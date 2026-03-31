# frozen_string_literal: true

module Api
  class V2::Administration::Dimensions::FactorsController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction
    validate_crud_requests Api::V2::Dimension::Factor::Schema
    before_action :set_resource, only: %i[copy update destroy show]
    # validates_request_schema :update, -> { Api::V2::Factor::UpdateContract.new }

    def create
      super
    end

    def copy
      audit! :copy, @factor, payload: { source_id: @factor.id }
      copied_factor = @factor.clone_and_save

      jsonapi_render json: copied_factor
    end

    private

    def set_resource
      @factor = ::Pundit.policy_scope!(current_user, [:api, :administration, Factor]).where(
        dimension_id: params[:dimension_id]
      ).find(params[:factor_id] || params[:id])
    end

    def file_params
      params.permit(:icon)
    end
  end
end
