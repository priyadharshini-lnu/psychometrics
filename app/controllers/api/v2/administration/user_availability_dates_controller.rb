# frozen_string_literal: true

module Api
  class V2::Administration::UserAvailabilityDatesController < Api::V2::Administration::BaseController
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
      params.require(:user_availability_date).permit(:start_date, :end_date, :timezone)
    end
  end
end
