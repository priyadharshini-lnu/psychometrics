# frozen_string_literal: true

module Api
  class V2::Administration::AIScoringApprovalSettingsController < Api::V2::Administration::BaseController
    validates_request_schema :create, -> { Api::V2::AIScoringApprovalSetting::CreateContract.new }
    validates_request_schema :update, -> { Api::V2::AIScoringApprovalSetting::UpdateContract.new }

    validate_crud_requests Api::V2::AIScoringApprovalSetting::Schema

    def policy_class
      Api::Administration::AI::ScoringApprovalSettingPolicy
    end

    def model_class
      AI::ScoringApprovalSetting
    end
  end
end
