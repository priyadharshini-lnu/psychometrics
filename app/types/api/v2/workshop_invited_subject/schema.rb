# frozen_string_literal: true

module Api
  module V2
    module WorkshopInvitedSubject
      class Schema < Api::Base::Schema
        def self.resource
          'workshop_invited_subjects'
        end

        def self.attributes(attribute, _)
          proc do
            attribute[:workshop_invite_id].filled(:string)
            attribute[:user_id].filled(:string)
          end
        end
      end
    end
  end
end
