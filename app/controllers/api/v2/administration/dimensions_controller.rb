# frozen_string_literal: true

module Api
  class V2::Administration::DimensionsController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction

    def copy
      audit! :copy, resource, payload: { source_id: resource.id }
      copied_dimension = resource.clone_and_save(user_id: current_user.id)
      jsonapi_render json: copied_dimension
    end

    private

    def resource
      @resource ||= Api::Administration::DimensionPolicy::Scope.new(
        current_user,
        Dimension
      ).resolve.find(params[:dimension_id])
    end
  end
end
