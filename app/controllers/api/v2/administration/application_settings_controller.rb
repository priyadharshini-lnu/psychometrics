# frozen_string_literal: true

module Api
  class V2::Administration::ApplicationSettingsController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction
    validate_crud_requests Api::V2::ApplicationSetting::Schema
  end
end
