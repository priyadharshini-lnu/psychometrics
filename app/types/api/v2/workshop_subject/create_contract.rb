# frozen_string_literal: true

module Api
  module V2
    module WorkshopSubject
      class CreateContract < Api::Base::Contract
        config.messages.namespace = :workshop_subject_create

        schema Api::V2::WorkshopSubject::Schema.create_request

        rule(data: { relationships: { user: { data: :id } } }) do
          existing_workshop_subject = ::WorkshopSubject.participatable.find_by(
            campaign: _context[:campaign], user_id: value
          )
          if existing_workshop_subject
            key.failure(:part_of_other_workshop, workshop_name: existing_workshop_subject.workshop.name)
          end
        end

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
