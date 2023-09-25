# frozen_string_literal: true

module Api
  module V2
    module WorkshopInvite
      class CreateRelationshipsContract < Api::Base::Contract
        config.messages.namespace = :workshop_invited_create_relationships

        schema Api::V2::WorkshopInvite::Schema.create_relationship_request(:workshops)

        rule(:data) do
          workshop_invite = ::WorkshopInvite.find(_context[:params][:workshop_invite_id])

          if value.count.zero?
            key.failure(:filled?)
          end

          if workshop_invite.workshop_ids.intersection(result[:data].collect { |e| e[:id].to_i }).present?
            key.failure(:already_invited)
          end

          if workshop_invite.workshops.count + value.count > ::WorkshopInvite::RESTRICTED_ASSESSMENT_CENTERS
            key.failure(:exceeded_workshops_count, { count: ::WorkshopInvite::RESTRICTED_ASSESSMENT_CENTERS })
          end
        end
      end
    end
  end
end
