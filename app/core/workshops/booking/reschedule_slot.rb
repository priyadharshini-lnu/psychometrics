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

          if reschedule_status? && workshop_id == new_workshop_id
            reschedule_existing_workshop_subject
          elsif reschedule_status?
            create_new_workshop_subject
            update_old_workshop_subject
          end
        end

        broadcast(:ok)
      end

      private

      def reschedule_status?
        status == 'rescheduled'
      end

      def create_new_workshop_subject
        WorkshopSubject.create!(
          user_id: current_user.id,
          workshop_id: new_workshop_id,
          campaign_id: workshop.campaign_id,
          workshop_invited_subject_id: workshop_invited_subject.id,
          scheduling_status: :scheduled,
          preferred_language: workshop_subject_details[:preferred_language],
          neurodivergent: workshop_subject_details[:neurodivergent],
          neurodivergent_comments: workshop_subject_details[:neurodivergent_comments]
        )
        increment_booked_seats(new_workshop_id)
      end

      def reschedule_existing_workshop_subject
        existing_workshop_subject.update!(
          preferred_language: workshop_subject_details[:preferred_language],
          neurodivergent: workshop_subject_details[:neurodivergent],
          neurodivergent_comments: workshop_subject_details[:neurodivergent_comments]
        )
      end

      def update_old_workshop_subject
        existing_workshop_subject.update!(scheduling_status: :rescheduled)
        existing_workshop_subject.workshop.decrement!(:booked_seats)
      end

      def existing_workshop_subject
        @existing_workshop_subject ||= WorkshopSubject.find_by(workshop_id: workshop_id, user_id: current_user.id)
      end
    end
  end
end
