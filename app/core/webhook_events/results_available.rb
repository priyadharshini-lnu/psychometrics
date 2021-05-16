# frozen_string_literal: true

module WebhookEvents
  class ResultsAvailable < WebhookEvents::Base
    attribute :report, type: Hash
    attribute :results, type: Hash

    def event_name
      'results_available'
    end

    def prepare_payload
      ctx = self.ctx || {}
      {
        report: {
          id: ctx[:report]&.id,
          name: ctx[:report]&.name
        },
        results: ctx[:results]
      }
    end
  end
end
