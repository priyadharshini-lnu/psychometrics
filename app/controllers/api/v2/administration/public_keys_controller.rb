# frozen_string_literal: true

module Api
  class V2::Administration::PublicKeysController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction
    validate_crud_requests Api::V2::ApplicationPublicKey::Schema

    def generate_key_pair
      result = ::Applications::PublicKeys::GenerateKeyPair.call!(
        user_id: params[:application_id],
        description: params.dig(:data, :attributes, :description),
        created_by_id: current_user.id
      )

      application_public_key = result[:application_public_key]

      audit! :generate_key_pair, application_public_key,
             payload: application_public_key.attributes.slice(
               'id', 'key_id', 'fingerprint', 'description', 'created_by_id'
             ), client: application_public_key.tenant
      render json: { private_key: result[:private_key] }
    end

    private

    def model_class
      ApplicationPublicKey
    end

    def policy_class
      Api::Administration::PublicKeyPolicy
    end
  end
end
