# frozen_string_literal: true

module Workshops
  module Booking
    class CancelSlot < Base
      private_attr_accessor :status, :reason, :params

      def initialize(params, current_user)
        super(params[:workshop_id], params[:id], current_user)
        @status = params[:status]
        @reason = params[:reason]
        @params = params
      end

      def call
        WorkshopInvite.transaction do
          workshop_invited_subject.update!(status: status, reason: reason)
          create_workshop_invite_log(status)
          cancel_booking if status == 'cancelled'
        end

        broadcast(:ok)
      end

      private

      def cancel_booking
        workshop.decrement!(:booked_seats)
        WorkshopSubject.find_by(
          workshop_id: workshop.id, user_id: current_user.id
        ).update!(scheduling_status: :cancelled)
      end
    end
  end
end
