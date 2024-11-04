# frozen_string_literal: true

module Api
  class V2::Administration::ClientPrivacySettingsController < Api::V2::Administration::BaseController
    validates_request_schema :update, Api::V2::ClientPrivacySettings::UpdateContract.new
    validate_crud_requests Api::V2::ClientPrivacySettings::Schema
  end
end
