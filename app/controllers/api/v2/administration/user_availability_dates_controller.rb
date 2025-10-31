# frozen_string_literal: true

module Api
  class V2::Administration::UserAvailabilityDatesController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction
    validate_crud_requests Api::V2::UserAvailabilityDate::Schema
    validates_request_schema :create, :create_contract
    validates_request_schema :update, :update_contract

    def create_contract
      Api::V2::UserAvailabilityDate::Contract.new(schema: Api::V2::UserAvailabilityDate::Schema.create_request)
    end

    def update_contract
      Api::V2::UserAvailabilityDate::Contract.new(schema: Api::V2::UserAvailabilityDate::Schema.update_request)
    end

    private

    def user_availability_date_params
      params.expect(user_availability_date: %i[start_date end_date timezone])
    end
  end
end
