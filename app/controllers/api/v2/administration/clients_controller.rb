# frozen_string_literal: true

module Api
  class V2::Administration::ClientsController < Api::V2::Administration::BaseController
    before_action :find_client, only: %i[create_client_admin]

    validate_crud_requests Api::V2::Client::Schema

    private

    def base_response_meta
      {
        countries: ::Datas::Geo.order(:country_name).select(:country_name).distinct.pluck(:country_name),
        types: Client.types.keys
      }
    end

    def find_client
      @client = Client.find(params[:client_id] || params[:id])
    end

    def membership_params
      params.require(:data).
        permit(attributes: {
          user_attributes: %i[email first_name last_name],
          grants_attributes: { data: {} }
        })
    end
  end
end
