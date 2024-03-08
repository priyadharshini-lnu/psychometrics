# frozen_string_literal: true

module Examus
  class GetSessionUrl < BaseCommand
    private_attr_reader :campaign_user, :campaign, :project

    def initialize(campaign_user)
      @campaign_user = campaign_user
      @campaign = campaign_user.campaign
      @project = campaign.project
    end

    def call
      result = Examus::FindOrCreateSession.call(@campaign_user)
      proctoring_session = result[:ok]

      if proctoring_session
        jwt = Examus::JwtTokenizer.encode(payload(proctoring_session))
        config = Rails.application.secrets.examus
        url = "#{config[:url]}/integration/simple/#{config[:integration_name]}/start/?token=#{jwt}"
        broadcast :ok, url
      else
        broadcast :error, result[:error]
      end
    end

    private

    def payload(proctoring_session)
      duration = ((campaign_user.compute_expiry_date.to_i - Time.now.to_i) / 60.0).ceil
      {
        userId: campaign_user.id.to_s,
        lastName: campaign_user.user.first_name,
        firstName: campaign_user.user.last_name,
        thirdName: '',
        language: 'en',
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
      token = campaign_user.user.generate_sso_token if campaign.campaign_options.ldb?
      Utility::Url.generate(:proctoring_redirect_campaign_user_url, subdomain: project.subdomain, id: campaign_user.id,
sso_token: token, user_id: campaign_user.user.id)
    end

    def campaign_url
      Utility::Url.generate(:campaign_url, subdomain: project.subdomain, id: campaign.id)
    end
  end
end
