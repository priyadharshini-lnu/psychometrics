# frozen_string_literal: true

module Api
  class V2::Administration::DesignSettingsController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::DesignSetting::Schema
  end
end
