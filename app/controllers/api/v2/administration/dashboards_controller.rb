# frozen_string_literal: true

module Api
  class V2::Administration::DashboardsController < Api::V2::Administration::BaseController
    validates_request_schema :update, Api::V2::Dashboard::UpdateContract.new
    validate_crud_requests Api::V2::Dashboard::Schema

    def context
      super.merge(
        embed_token: params.dig(:query, :embed_token)
      )
    end
  end
end
