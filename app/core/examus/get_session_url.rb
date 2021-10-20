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
      proctoring_session, = Examus::FindOrCreateSession.call!(campaign_user)
      jwt = Examus::JWTTokenizer.encode(payload(proctoring_session))
      config = Rails.application.secrets.examus
      url = "#{config[:url]}/integration/simple/#{config[:integration_name]}/start/?token=#{jwt}"

      broadcast :ok, url
    end

    private

    def payload(proctoring_session)
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
        duration: ((campaign_user.expiry_date.to_i - Time.now.to_i) / 60.0).ceil,
        schedule: false,
        proctoring: 'offline',
        identification: campaign.identification,
        rules: campaign.rules,
        startDate: campaign_user.started_at.iso8601,
        endDate: campaign_user.expiry_date.iso8601,
        sessionId: proctoring_session.session_id,
        sessionUrl: campaign_url,
        sessionFinishUrl: campaign_url
      }
    end

    def campaign_url
      Rails.application.routes.url_helpers.campaign_url(campaign, {
        host: Settings.domain,
        subdomain: project.subdomain,
        protocol: Settings.protocol,
        port: Settings.port
      })
    end
  end
end
