# frozen_string_literal: true

module Workshops
  module InviteRequest
    class RejectRequest < Base
      def call
        broadcast(:invalid) unless workshop_invited_subject.rejectable?

        WorkshopInvitedSubject.transaction do
          workshop_invited_subject.public_send("#{status}!")
          create_workshop_invite_log(status)
        end

        broadcast(:ok, workshop_invited_subject)
      end

      private

      def status
        @status ||= "#{workshop_invited_subject.status}_rejected"
      end
    end
  end
end
