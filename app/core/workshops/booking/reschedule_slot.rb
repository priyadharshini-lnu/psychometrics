# frozen_string_literal: true

module Workshops
  module Booking
    class RescheduleSlot < Base
      private_attr_accessor :new_workshop_id, :status, :reason, :workshop_subject_details, :params

      def initialize(params, current_user)
        super(params[:workshop_id], params[:id], current_user)
        @new_workshop_id = params[:new_workshop_booking_id]
        @status = params[:status]
        @reason = params[:reason]
        @workshop_subject_details = params[:workshop_subject_details]
        @params = params
      end

      def call
        WorkshopInvite.transaction do
          workshop_invited_subject.update!(status: status, reason: reason)
          create_workshop_invite_log(status)
          update_workshop_subject if reschedule_status?
        end

        broadcast(:ok)
      end

      private

      def reschedule_status?
        status == 'rescheduled'
      end

      def update_workshop_subject
        WorkshopSubject.find_by(workshop_id: workshop_id, user_id: current_user.id).update!(
          workshop_id: new_workshop_id,
          neurodivergent: workshop_subject_details[:neurodivergent],
          preferred_language: workshop_subject_details[:preferred_language],
          neurodivergent_comments: workshop_subject_details[:neurodivergent_comments]
        )
      end
    end
  end
end
