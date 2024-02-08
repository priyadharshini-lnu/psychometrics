# frozen_string_literal: true

module Api
  module V2
    module Membership
      class CreateContract < Api::Base::Contract
        config.messages.namespace = :admin
        schema Api::V2::Membership::Schema.create_request

        rule(data: { attributes: :email }).validate(email_format: { allow_blank: true })

        rule(data: { attributes: :user_id }) do
          current_client_id = values.dig(:data, :attributes, :client_id) || values.dig(:data, :attributes, :project_id)
          key.failure(:already_added) if ::Membership.exists?(user_id: value, client_id: current_client_id)
        end

        rule(data: { attributes: :project_id }) do
          current_client_id = value || values.dig(:data, :attributes, :client_id)
          key.failure(:already_added) if ::Membership.exists?(
            user_id: values.dig(:data, :attributes, :user_id),
            client_id: current_client_id
          )
        end
      end
    end
  end
end
