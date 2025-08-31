# frozen_string_literal: true

module Workshops
  module InviteRequest
    class ResendRequest < Base
      private_attr_reader :workshop_invite_subject_ids

      def initialize(workshop_invite_subject_ids)
        @workshop_invite_subject_ids = workshop_invite_subject_ids
      end

      def call
        results = []

        WorkshopInvitedSubject.where(id: workshop_invite_subject_ids).find_each do |workshop_invite_subject|
          WorkshopInvites::SendEmail.call!(workshop_invite_subject, resent: true)
          results << { id: workshop_invite_subject.id, status: 'resent' }
        rescue StandardError => e
          results << { id: workshop_invite_subject.id, status: 'error', error: e.message }
        end

        broadcast :ok, results
      end
    end
  end
end
