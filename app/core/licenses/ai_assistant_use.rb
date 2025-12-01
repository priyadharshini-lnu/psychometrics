# frozen_string_literal: true

module Licenses
  class AIAssistantUse < BaseCommand
    private_attr_accessor :campaign, :user, :client, :ai_assistant_chat

    def initialize(campaign, user, ai_assistant_chat)
      @campaign = campaign
      @user = user
      @ai_assistant_chat = ai_assistant_chat
      @client = campaign.client
    end

    def call
      licenses = client.licenses.available.type_ai_assistant.order(end_date: :asc)
      return broadcast :ok if LicenseUsage.exists?(campaign: campaign, user: user, consumer: ai_assistant_chat,
                                                   status: :active)

      license = licenses.detect(&:enough_licenses?)

      if license
        license_usage = license.license_usages.create!(
          campaign: campaign,
          client: client,
          user: user,
          consumer: ai_assistant_chat,
          project: campaign.project,
          extras: {
            subject_email: user.email,
            subject_name: user.name,
            campaign_name: campaign.name,
            ai_assistant_name: ai_assistant_chat.ai_assistant.name
          }
        )
        return broadcast :ok, license_usage
      end

      raise Licenses::NotEnoughError, I18n.t('licenses.not_enough_ai_assistant_license')
    end
  end
end
