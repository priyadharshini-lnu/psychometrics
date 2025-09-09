# frozen_string_literal: true

module Api
  module V2
    class Administration::UserSavedFiltersController < Administration::BaseController
      skip_before_action :enforce_geo_restriction
      validates_request_schema :create, lambda {
        UserSavedFilter::Contract.new(schema: UserSavedFilter::Schema.create_request)
      }
      validates_request_schema :update, lambda {
        UserSavedFilter::Contract.new(schema: UserSavedFilter::Schema.update_request)
      }
      validate_crud_requests UserSavedFilter::Schema
    end
  end
end
