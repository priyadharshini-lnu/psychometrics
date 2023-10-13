# frozen_string_literal: true

module Api
  module V2
    module WorkshopSubject
      class CreateContract < Api::Base::Contract
        config.messages.namespace = :workshop_subject_create

        schema Api::V2::WorkshopSubject::Schema.create_request

        rule(data: { relationships: { user: { data: :id } } }) do
          subject_exists = ::WorkshopSubject.exists?(
            user_id: value, workshop_id: values.dig(:data, :relationships, :workshop, :data, :id)
          )
          key.failure(:already_exists) if subject_exists
        end
      end
    end
  end
end
