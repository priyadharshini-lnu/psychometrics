# frozen_string_literal: true

module Workshops
  module Booking
    class Base < BaseCommand
      private_attr_accessor :workshop_invite, :workshop_id, :current_user

      def initialize(workshop_id, workshop_invite_id, current_user)
        @workshop_invite = WorkshopInvite.find(workshop_invite_id)
        @workshop_id = workshop_id
        @current_user = current_user
      end

      protected

      def workshop_invited_subject
        @workshop_invited_subject ||= WorkshopInvitedSubject.find_by(
          workshop_invite_id: workshop_invite.id, user_id: current_user.id
        )
      end

      def workshop
        @workshop ||= Workshop.find(workshop_id)
      end

      def create_workshop_invite_log(action)
        WorkshopInviteLog.create!(
          workshop_invite_id: workshop_invite.id,
          user_id: current_user.id,
          created_by_id: current_user.id,
          action: action
        )
      end
    end
  end
end
