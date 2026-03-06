# frozen_string_literal: true

module Api
  class V2::Administration::AssessmentConsentSettingsController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction
    validate_crud_requests Api::V2::AssessmentConsentSetting::Schema
    validates_request_schema :update, :update_request_contract_and_schema

    def update_request_contract_and_schema
      Api::V2::AssessmentConsentSetting::Contract.new(
        schema: Api::V2::AssessmentConsentSetting::Schema.update_request
      )
    end

    private

    def model
      @model ||= AssessmentConsentSetting.find_or_initialize_by(assessment_id: params[:id])
    end
  end
end
