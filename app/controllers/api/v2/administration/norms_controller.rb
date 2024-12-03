# frozen_string_literal: true

module Api
  class V2::Administration::NormsController < Api::V2::Administration::BaseController
    include Api::V2::Administration::Concerns::MockedResponse

    mock_custom_actions %i[editor]
    validate_crud_requests Api::V2::Norm::Schema

    before_action :set_resource, only: %i[copy]

    def copy
      audit! :copy, @resource, payload: { source_id: @resource.id }
      result = ::Norms::CopyNorm.call!(
        norm: @resource,
        user: current_user,
        owner_id: params.dig(:data, :attributes, :owner_id),
        new_norm_name: params.dig(:data, :attributes, :name)
      )

      jsonapi_render json: result
    end

    private

    def set_resource
      @resource = Api::Administration::NormPolicy::Scope.new(
        current_user, Norm
      ).resolve.find(params[:norm_id])
    end
  end
end
