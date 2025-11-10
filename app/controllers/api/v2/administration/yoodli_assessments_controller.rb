# frozen_string_literal: true

module Api
  class V2::Administration::YoodliAssessmentsController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction
    validate_crud_requests Api::V2::YoodliAssessment::Schema
    validates_request_schema :create, -> { Api::V2::YoodliAssessment::CreateContract.new }
    validates_request_schema :update, -> { Api::V2::YoodliAssessment::UpdateContract.new }
  end
end
