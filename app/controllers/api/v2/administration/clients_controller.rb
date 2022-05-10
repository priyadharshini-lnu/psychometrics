# frozen_string_literal: true

module Api
  class V2::Administration::ClientsController < Api::V2::Administration::BaseController
    before_action :find_client, only: %i[create_client_admin]

    validate_crud_requests Api::V2::Client::Schema

    def create_client_admin
      Api::V2::Memberships::CreateAdminCommand.
        call(Membership.new(membership_params), @client, current_user, Membership::CLIENT_ADMIN_ROLE) do
          on(:invalid) { jsonapi_render_errors json: form }
          on(:ok) { |membership| render json: serialize_user(membership.user) }
        end
    end

    private

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
