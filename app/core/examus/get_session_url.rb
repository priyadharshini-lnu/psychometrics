# frozen_string_literal: true

module Examus
  class GetSessionUrl < BaseCommand
    AVAILABLE_LOCALES = %i[en ar].freeze

    private_attr_reader :subject, :campaign_user, :campaign, :project, :locale, :system_check_session_id

    def initialize(campaign_user:, locale:, subject: nil, system_check_session_id: nil)
      @subject = subject
      @campaign_user = campaign_user
      @campaign = campaign_user.campaign
      @project = campaign.project
      @locale = AVAILABLE_LOCALES.include?(locale) ? locale : 'en'
      @system_check_session_id = system_check_session_id
    end

    def call
      result = Examus::FindOrCreateSession.call(campaign_user: campaign_user, subject: subject)
      proctoring_session = result[:ok]

      if proctoring_session
        jwt = Examus::JwtTokenizer.encode(payload(proctoring_session))
        config = Settings.secrets.examus
        url = "#{config[:url]}/integration/simple/#{config[:integration_name]}/start/?token=#{jwt}"
        broadcast :ok, url
      else
        broadcast :error, result[:error]
      end
    end

    private

    def payload(proctoring_session) # rubocop:disable Metrics/AbcSize
      expiry_date = (subject || campaign_user).compute_expiry_date
      duration = expiry_date ? ((expiry_date.to_i - Time.now.to_i) / 60.0).ceil : 0
      maskable_identity = campaign_user.user.maskable_identity(
        mask: project.mask_identity_for_examus?
      )
      {
        userId: campaign_user.id.to_s,
        lastName: maskable_identity.first_name,
        firstName: maskable_identity.last_name,
        thirdName: '',
        language: locale,
        accountId: project.project.id,
        accountName: project.name,
        examId: campaign.id.to_s,
        courseName: '',
        examName: campaign.name,
        duration: duration,
        schedule: false,
        proctoring: campaign.proctoring_type,
        identification: campaign.identification,
        rules: campaign.rules,
        # The user can start the test only after startDate
        startDate: 1.minute.ago.iso8601,
        # The user can start the test only before endDate
        endDate: 1.hour.from_now.iso8601,
        sessionId: proctoring_session.session_id,
        sessionUrl: session_url,
        sessionFinishUrl: campaign_url,
        ldb: campaign.campaign_options.ldb?,
        trial: campaign.campaign_options.proctoring_trial?
      }
    end

    def session_url
      resource_id = subject.present? ? subject.id : campaign_user.id
      Utility::Url.generate(
        resource_url,
        subdomain: project.subdomain,
        id: resource_id,
        jwt: jwt_token,
        user_id: campaign_user.user.id
      )
    end

    def resource_url
      return :proctoring_redirect_campaign_user_url if subject.blank?
      return :agile_user_assessment_url if subject.assessment.agile?

      :pass_user_assessment_url
    end

    def campaign_url
      Utility::Url.generate(:campaign_url, subdomain: project.subdomain, id: campaign.id, jwt: jwt_token)
    end

    def jwt_token
      user = campaign_user.user
      JWT.encode(
        {
          'sub' => user.id,
          'exp' => 1.day.from_now.to_i,
          details: {
            skip_session_limitable: true,
            system_check_session_id: system_check_session_id
          }
        },
        Settings.secrets.encrypted_key.to_s,
        'HS256'
      )
    end
  end
end
