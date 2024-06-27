# frozen_string_literal: true

module WebhookEvents
  class CampaignResultsAvailable < WebhookEvents::Base
    attribute :results, type: Array

    def event_name
      'campaign_results_available'
    end

    def prepare_payload
      ctx = self.ctx || {}
      {
        results: ctx[:results]
      }
    end
  end
end
