# frozen_string_literal: true

module Api
  module V2
    module WorkshopInvitedSubject
      class CreateContract < Api::Base::Contract
        config.messages.namespace = :workshop_invited_subject_create

        schema Api::V2::WorkshopInvitedSubject::Schema.create_request

        rule(data: { relationships: { user: { data: :id } } }) do
          subject_exists = ::WorkshopInvitedSubject.exists?(
            user_id: value, workshop_invite_id: values.dig(:data, :relationships, :workshop_invite, :data, :id)
          )
          key.failure(:already_exists) if subject_exists
        end
      end
    end
  end
end
