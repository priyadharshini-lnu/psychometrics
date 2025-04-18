# frozen_string_literal: true

class Api::V2::Administration::ProjectAssessmentsController < Api::V2::Administration::BaseController
  validates_request_schema :create, Api::V2::ProjectAssessment::Contract.new(
    schema: Api::V2::ProjectAssessment::Schema.create_request
  )
  validates_request_schema :update, Api::V2::ProjectAssessment::Contract.new(
    schema: Api::V2::ProjectAssessment::Schema.update_request
  )

  validate_crud_requests Api::V2::ProjectAssessment::Schema
end
