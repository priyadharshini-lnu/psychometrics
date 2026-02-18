# frozen_string_literal: true

module Api
  class V2::Administration::UserAssessmentsController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::UserAssessment::Schema
    skip_before_action :enforce_geo_restriction
  end
end
