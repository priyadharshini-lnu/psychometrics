# frozen_string_literal: true

module Api
  class V2::Administration::TagsController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction
    append_before_action :pundit_authorize
    before_action :require_taggable_resource_type, only: :index

    rescue_from ActionController::ParameterMissing, with: :render_parameter_missing

    def context
      super.merge(
        filter: { taggable_resource_type: params[:query]&.[](:taggable_resource_type) }
      )
    end

    private

    def require_taggable_resource_type
      return if params[:query]&.[](:taggable_resource_type).present?

      raise ActionController::ParameterMissing, :taggable_resource_type
    end

    def render_parameter_missing(exception)
      jsonapi_render_errors [{ detail: exception.message }], status: :bad_request
    end

    def pundit_authorize
      authorize(
        nil,
        nil,
        policy_class: Api::Administration::TagPolicy
      )
    end
  end
end
