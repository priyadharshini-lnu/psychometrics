# frozen_string_literal: true

module Workshops
  module InviteRequest
    class CancelRequest < Base
      private_attr_accessor :workshop, :subject_id

      def initialize(params, current_user)
        super

        @workshop = Workshop.find(@workshop_invited_subject.workshop_subject.workshop_id)
        @subject_id = @workshop_invited_subject.user_id
      end

      def call
        broadcast(:invalid) unless workshop_invited_subject.cancellable?

        WorkshopInvitedSubject.transaction do
          workshop_invited_subject.cancelled!
          create_workshop_invite_log(workshop_invited_subject.status)
          remove_workshop_subject
        end

        broadcast(:ok, workshop_invited_subject)
      end

      private

      def remove_workshop_subject
        workshop_invited_subject.workshop_subject.update!(scheduling_status: :late_cancelled)
        workshop.decrement!(:booked_seats)
      end
    end
  end
end
