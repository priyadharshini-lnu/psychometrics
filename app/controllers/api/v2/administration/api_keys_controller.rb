# frozen_string_literal: true

module Api
  class V2::Administration::ApiKeysController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction
    validate_crud_requests Api::V2::ApiKey::Schema

    def meta_details
      {
        user: -> { { email: ::Users::Application.find(params[:application_id]).email } }
      }
    end
  end
end
