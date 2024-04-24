# frozen_string_literal: true

module Api
  class V2::Administration::PrivacySettingsController < Api::V2::Administration::BaseController
    validates_request_schema :update, Api::V2::PrivacySettings::UpdateContract.new
    validate_crud_requests Api::V2::PrivacySettings::Schema
  end
end
