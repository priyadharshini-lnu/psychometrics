# frozen_string_literal: true

module WebhookEvents
  class AssessmentRawResponse < WebhookEvents::AssessmentStarted
    def event_name
      'assessment_raw_response'
    end

    def prepare_payload
      ctx = self.ctx || {}
      {
        assessment_raw_response: ctx[:answers]
      }.merge(super)
    end
  end
end
