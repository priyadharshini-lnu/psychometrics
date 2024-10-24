# frozen_string_literal: true

class Api::V2::Administration::ProjectAssessmentsController < Api::V2::Administration::BaseController
  validate_crud_requests Api::V2::ProjectAssessment::Schema
end
