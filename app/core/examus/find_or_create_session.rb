# frozen_string_literal: true

module Examus
  class FindOrCreateSession < BaseCommand
    private_attr_reader :campaign_user

    def initialize(campaign_user)
      @campaign_user = campaign_user
    end

    def call
      proctoring_session = ProctoringSession.order(id: :desc).find_by(campaign_user_id: campaign_user.id)
      type = :exists
      if proctoring_session.nil? || !Examus::IsSessionAlive.call!(proctoring_session.session_id)
        proctoring_session = ProctoringSession.create(
          session_id: SecureRandom.uuid,
          campaign_user_id: campaign_user.id,
          started_at: campaign_user.started_at
        )
        type = :new
        license = campaign_user.campaign.proctoring_license
        credits = Campaigns::Proctoring::GetProctoringCredits.call!(campaign_user.campaign)

        if license
          LicenseUsage.create(
            campaign_id: campaign_user.campaign_id,
            user_id: campaign_user.user_id,
            client_id: campaign_user.campaign.client.id,
            license_id: license.id,
            proctoring_session_id: proctoring_session.id,
            proctoring_credits_debited: credits
          )
          license.update(used_number: license.used_number + credits)
        end
      end

      broadcast :ok, proctoring_session, type: type
    end
  end
end
