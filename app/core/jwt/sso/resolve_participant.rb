# frozen_string_literal: true

module Jwt
  module Sso
    class ResolveParticipant < BaseCommand
      private_attr_reader :subject, :campaign_id

      def initialize(subject:, campaign_id:)
        @subject = subject
        @campaign_id = campaign_id
      end

      def call
        return broadcast(:error, :participant_not_found) if subject.blank?

        project = Campaign.find_by(id: campaign_id)&.project
        return broadcast(:error, :participant_not_found) unless project

        participant = find_participant(project)

        return broadcast(:error, :participant_not_found) unless participant
        return broadcast(:error, :participant_disabled) unless participant.active_for_authentication?

        broadcast(:ok, participant)
      end

      private

      def find_participant(project)
        normalized_subject = subject.to_s.strip

        if normalized_subject.match?(Devise.email_regexp)
          Users::Regular.find_by(email: normalized_subject, project_id: project.id)
        else
          Users::Regular.find_by(id: normalized_subject, project_id: project.id)
        end
      end
    end
  end
end
