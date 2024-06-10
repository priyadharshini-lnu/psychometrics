# frozen_string_literal: true

module Api
  class V2::Administration::RegistrationSettingsController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::RegistrationSetting::Schema

    def context
      super.merge(
        project_id: params[:project_id]
      )
    end
  end
end
