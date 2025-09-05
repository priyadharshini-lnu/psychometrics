# frozen_string_literal: true

module Api
  class V2::Administration::TagsController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction
    append_before_action :pundit_authorize

    def context
      super.merge(
        filter: { taggable_resource_type: params[:query][:taggable_resource_type] }
      )
    end

    private

    def pundit_authorize
      authorize(
        nil,
        nil,
        policy_class: Api::Administration::TagPolicy
      )
    end
  end
end
