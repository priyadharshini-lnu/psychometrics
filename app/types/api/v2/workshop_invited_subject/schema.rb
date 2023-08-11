# frozen_string_literal: true

module Api
  module V2
    module WorkshopInvitedSubject
      class Schema < Api::Base::Schema
        def self.resource
          'workshop_invited_subjects'
        end

        def self.relationships(_)
          [
            { name: :user, resource: :users, relationship: :one, required: true },
            { name: :workshop_invite, resource: :workshop_invites, relationship: :one, required: true }
          ]
        end

        def self.links?
          false
        end
      end
    end
  end
end
