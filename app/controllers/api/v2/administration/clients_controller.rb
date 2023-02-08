# frozen_string_literal: true

module Api
  class V2::Administration::ClientsController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::Client::Schema

    private

    def meta_details
      {
        countries: -> { ::Datas::Geo.order(:country_name).select(:country_name).distinct.pluck(:country_name) },
        types: -> { Client.types.keys }
      }
    end
  end
end
