# frozen_string_literal: true

module Api
  class V2::Administration::DesignSettingsController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction, only: :update
    validate_crud_requests Api::V2::DesignSetting::Schema

    def project_id
      @model&.project_id || params.dig(:filter, :project_id_eq)
    end

    def client_id
      @model&.client_id || params.dig(:filter, :client_id_eq)
    end
  end
end
