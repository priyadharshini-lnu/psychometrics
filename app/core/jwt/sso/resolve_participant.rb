# frozen_string_literal: true

module Jwt
  module Sso
    class ResolveParticipant < BaseCommand
      private_attr_reader :subject

      def initialize(subject:)
        @subject = subject
      end

      def call
        return broadcast(:error, :participant_not_found) if subject.blank?

        participant = find_participant
        return broadcast(:error, :participant_not_found) unless participant
        return broadcast(:error, :participant_disabled) unless participant.active_for_authentication?

        broadcast(:ok, participant)
      end

      private

      def find_participant
        normalized_subject = subject.to_s.strip

        if normalized_subject.match?(Devise.email_regexp)
          Users::Regular.find_by(email: normalized_subject, project_id: Current.project.id)
        else
          Users::Regular.find_by(id: normalized_subject, project_id: Current.project.id)
        end
      end
    end
  end
end
