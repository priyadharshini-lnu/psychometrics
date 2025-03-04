# frozen_string_literal: true

module Workshops
  module InviteRequest
    class RescheduleRequest < Base
      private_attr_accessor :workshop, :subject_id, :reschedule_workshop_id

      def initialize(params, current_user)
        super

        @workshop = Workshop.find(@workshop_invited_subject.workshop_subject.workshop_id)
        @subject_id = @workshop_invited_subject.user_id
        @reschedule_workshop_id = @workshop_invited_subject.reschedule_workshop_id
      end

      def call
        broadcast(:invalid) unless reschedule_workshop_id && workshop_invited_subject.reschedulable?

        WorkshopInvitedSubject.transaction do
          workshop_invited_subject.rescheduled!
          create_workshop_invite_log(workshop_invited_subject.status)
          update_workshop_subject
        end

        broadcast(:ok, workshop_invited_subject)
      end

      private

      def update_workshop_subject
        old_workshop_subject = WorkshopSubject.find_by(workshop_id: workshop.id, user_id: subject_id)

        WorkshopSubject.find_or_initialize_by(
          user_id: subject_id,
          workshop_id: reschedule_workshop_id
        ).update(
          campaign_id: old_workshop_subject.campaign_id,
          workshop_invited_subject_id: old_workshop_subject.workshop_invited_subject_id,
          neurodivergent: workshop_invited_subject[:neurodivergent],
          preferred_language: workshop_invited_subject[:preferred_language],
          neurodivergent_comments: workshop_invited_subject[:neurodivergent_comments],
          scheduling_status: :scheduled
        )

        old_workshop_subject.update!(scheduling_status: :late_rescheduled)
        workshop.decrement!(:booked_seats)
        Workshop.find(reschedule_workshop_id).increment!(:booked_seats)
      end
    end
  end
end
