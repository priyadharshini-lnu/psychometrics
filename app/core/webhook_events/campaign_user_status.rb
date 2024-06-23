# frozen_string_literal: true

module WebhookEvents
  class CampaignUserStatus < WebhookEvents::Base
    attribute :status, type: String

    def event_name
      'campaign_user_status'
    end

    def prepare_payload
      ctx = self.ctx || {}
      {
        status: ctx[:status]
      }
    end
  end
end
