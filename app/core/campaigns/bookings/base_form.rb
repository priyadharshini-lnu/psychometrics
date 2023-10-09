# frozen_string_literal: true

module Campaigns
  module Bookings
    class BaseForm < Rectify::Form
      attribute :id, Boolean
      attribute :workshop_id, Integer
      attribute :current_user, User

      validates :id, :workshop_id, :current_user, presence: true

      protected

      def workshop
        @workshop ||= Workshop.find(workshop_id)
      end

      def workshop_invite
        @workshop_invite ||= WorkshopInvite.find(id)
      end
    end
  end
end
