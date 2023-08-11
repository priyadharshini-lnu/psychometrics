# frozen_string_literal: true

module Api
  class V2::Administration::WorkshopInvitedSubjectsController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::WorkshopInvitedSubject::Schema
    validates_request_schema :create, Api::V2::WorkshopInvitedSubject::CreateContract.new
  end
end
