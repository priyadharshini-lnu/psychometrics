# frozen_string_literal: true

module Examus
  class FindOrCreateSession < BaseCommand
    private_attr_reader :campaign_user

    def initialize(campaign_user)
      @campaign_user = campaign_user
    end

    def call
      proctoring_session = ProctoringSession.order(id: :desc).find_by(campaign_user_id: campaign_user.id)
      if proctoring_session.nil? || !Examus::IsSessionAlive.call!(proctoring_session.session_id)
        proctoring_session = ProctoringSession.create(
          session_id: SecureRandom.uuid,
          campaign_user_id: campaign_user.id,
          started_at: campaign_user.started_at
        )
      end

      broadcast :ok, proctoring_session
    end
  end
end
