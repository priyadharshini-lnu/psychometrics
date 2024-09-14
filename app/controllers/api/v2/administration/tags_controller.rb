# frozen_string_literal: true

module Api
  class V2::Administration::TagsController < Api::V2::Administration::BaseController
    append_before_action :pundit_authorize

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
