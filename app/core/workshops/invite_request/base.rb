# frozen_string_literal: true

module Workshops
  module InviteRequest
    class Base < BaseCommand
      private_attr_accessor :workshop_invited_subject, :current_user

      def initialize(params, current_user)
        @workshop_invited_subject = WorkshopInvitedSubject.find(params[:id])
        @current_user = current_user
      end

      protected

      def create_workshop_invite_log(action)
        WorkshopInviteLog.create!(
          workshop_invite_id: workshop_invited_subject.workshop_invite.id,
          user_id: current_user.id,
          created_by_id: current_user.id,
          action: action
        )
      end
    end
  end
end
