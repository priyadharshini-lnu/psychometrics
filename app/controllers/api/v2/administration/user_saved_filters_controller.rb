# frozen_string_literal: true

module Api
  module V2
    class Administration::UserSavedFiltersController < Administration::BaseController
      validates_request_schema :create, UserSavedFilter::Contract.new(schema: UserSavedFilter::Schema.create_request)
      validates_request_schema :update, UserSavedFilter::Contract.new(schema: UserSavedFilter::Schema.update_request)
      validate_crud_requests UserSavedFilter::Schema
    end
  end
end
