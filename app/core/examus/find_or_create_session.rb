# frozen_string_literal: true

module Examus
  class FindOrCreateSession < BaseCommand
    private_attr_reader :campaign_user

    def initialize(campaign_user)
      @campaign_user = campaign_user
    end

    def call # rubocop:disable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity,Metrics/AbcSize
      proctoring_session = ProctoringSession.order(id: :desc).find_by(
        campaign_user_id: campaign_user.id, invalid_session: false, completed_at: nil
      )
      status_response = Examus::GetSession.call!(proctoring_session.session_id) if proctoring_session
      ProctoringSessions::MarkInvalid.call!(proctoring_session) if proctoring_session.present? && status_response.nil?
      existing_session_can_be_used = %w[started ready_to_start].include?(status_response&.dig('status'))

      if proctoring_session.nil? || !existing_session_can_be_used
        license = campaign_user.campaign.proctoring_license_with_enough_credits

        if license.nil? && !campaign_user.campaign.campaign_options.proctoring_trial?
          return broadcast :error, I18n.t('licenses.not_enough_proctoring_credits')
        end

        if license&.is_project_specific?
          project_license = ProjectLicense.find_by(
            project_id: campaign_user.campaign.project_id,
            license_id: license.id
          )
          credits = Campaigns::Proctoring::GetProctoringCredits.call!(campaign_user.campaign)
          unless project_license&.enabled? && project_license.enough_license_credits?(credits)
            message = I18n.t('licenses.project_limit_reached', license_name: 'Proctoring License')
            return broadcast :error, message
          end
        end

        proctoring_session = ProctoringSession.create(
          session_id: SecureRandom.uuid,
          campaign_user_id: campaign_user.id,
          started_at: Time.zone.now
        )

        if license && !campaign_user.campaign.campaign_options.proctoring_trial?
          deduct_license(license, proctoring_session)
        end
      end

      broadcast :ok, proctoring_session
    end

    def deduct_license(license, proctoring_session)
      credits = Campaigns::Proctoring::GetProctoringCredits.call!(campaign_user.campaign)
      if license.is_project_specific?
        project_license = ProjectLicense.find_by(
          project_id: campaign_user.campaign.project_id,
          license_id: license.id
        )
      end
      LicenseUsage.create(
        campaign_id: campaign_user.campaign_id,
        user_id: campaign_user.user_id,
        client_id: campaign_user.campaign.client.id,
        project_id: campaign_user.campaign.project.id,
        license_id: license.id,
        project_license_id: project_license&.id,
        proctoring_session_id: proctoring_session.id,
        proctoring_credits_debited: credits,
        extras: {
          subject_name: campaign_user.user.name,
          subject_email: campaign_user.user.email,
          campaign_name: campaign_user.campaign.name
        }
      )
      license.increment!(:used_number, credits)
      project_license&.increment!(:used_number, credits)
    end
  end
end
