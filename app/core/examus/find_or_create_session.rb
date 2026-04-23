# frozen_string_literal: true

module Examus
  class FindOrCreateSession < BaseCommand
    private_attr_reader :subject, :campaign_user

    def initialize(campaign_user:, subject: nil)
      @subject = subject
      @campaign_user = campaign_user
    end

    def call
      filters = { campaign_user_id: campaign_user.id, invalid_session: false, completed_at: nil }
      filters[:user_assessment_id] = subject.id if subject.present?

      proctoring_session = ProctoringSession.order(id: :desc).find_by(filters)

      status_response = Examus::GetSession.call!(proctoring_session.session_id) if proctoring_session
      ProctoringSessions::MarkInvalid.call!(proctoring_session) if proctoring_session.present? && status_response.nil?
      existing_session_can_be_used = %w[started ready_to_start].include?(status_response&.dig('status'))

      if proctoring_session.nil? || !existing_session_can_be_used
        proctoring_session = create_proctoring_session
      end

      broadcast :ok, proctoring_session
    rescue Licenses::NotEnoughError => e
      broadcast :error, e.message
    end

    private

    def create_proctoring_session
      unless campaign_user.campaign.campaign_options.proctoring_trial?
        context = subject.present? ? { user_assessment: subject } : {}

        license_usage_details = LicenseManager::Deductor.call!(
          campaign: campaign_user.campaign,
          user: campaign_user,
          license_type: 'proctoring',
          context: context
        )
      end

      session_attributes = {
        session_id: SecureRandom.uuid,
        campaign_user_id: campaign_user.id,
        started_at: Time.zone.now
      }
      session_attributes[:user_assessment_id] = subject.id if subject.present?

      proctoring_session = ProctoringSession.create(session_attributes)

      license_usage_details&.update!(
        proctoring_session_id: proctoring_session.id,
        proctoring_credits_debited: Campaigns::Proctoring::GetProctoringCredits.call!(
          campaign_user.campaign,
          subject
        )
      )

      proctoring_session
    end
  end
end
