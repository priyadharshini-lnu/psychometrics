# frozen_string_literal: true

module Examus
  class FindOrCreateSession < BaseCommand
    private_attr_reader :campaign_user

    def initialize(campaign_user)
      @campaign_user = campaign_user
    end

    def call
      proctoring_session = ProctoringSession.order(id: :desc).find_by(
        campaign_user_id: campaign_user.id, invalid_session: false, completed_at: nil
      )
      status_response = Examus::GetSession.call!(proctoring_session.session_id) if proctoring_session
      ProctoringSessions::MarkInvalid.call!(proctoring_session) if proctoring_session.present? && status_response.nil?
      existing_session_can_be_used = %w[started ready_to_start].include?(status_response&.dig('status'))

      if proctoring_session.nil? || !existing_session_can_be_used
        unless campaign_user.campaign.campaign_options.proctoring_trial?
          license_usage_details = LicenseManager::Deductor.call!(
            campaign: campaign_user.campaign,
            user: campaign_user,
            license_type: 'proctoring',
            context: {}
          )
        end

        proctoring_session = ProctoringSession.create(
          session_id: SecureRandom.uuid,
          campaign_user_id: campaign_user.id,
          started_at: Time.zone.now
        )

        license_usage_details&.update!(
          proctoring_session_id: proctoring_session.id,
          proctoring_credits_debited: Campaigns::Proctoring::GetProctoringCredits.call!(campaign_user.campaign)
        )

      end

      broadcast :ok, proctoring_session
    rescue Licenses::NotEnoughError => e
      broadcast :error, e.message
    end
  end
end
