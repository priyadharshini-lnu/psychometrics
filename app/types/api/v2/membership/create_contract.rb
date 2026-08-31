# frozen_string_literal: true

module Api
  module V2
    module Membership
      class CreateContract < Api::Base::Contract
        config.messages.namespace = :admin
        schema Api::V2::Membership::Schema.create_request

        rule(data: { attributes: :email }).validate(email_format: { allow_blank: true })

        rule(data: { attributes: :user_id }) do
          client_id = values.dig(:data, :attributes, :client_id) || values.dig(:data, :attributes, :project_id)
          campaign_id = values.dig(:data, :attributes, :campaign_id)
          role = values.dig(:data, :attributes, :role)
          user_ids = value.presence || begin
            email = values.dig(:data, :attributes, :email)
            [::User.find_by(email: email)&.id].compact
          end
          if ::Membership.exists?(user_id: user_ids, client_id: client_id, campaign_id: campaign_id, role: role)
            key.failure(:already_added)
          end
        end
      end
    end
  end
end
