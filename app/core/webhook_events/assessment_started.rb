# frozen_string_literal: true

module WebhookEvents
  class AssessmentStarted < WebhookEvents::Base
    attribute :assessment, type: Hash
    attribute :evaluator, type: Hash

    def event_name
      'assessment_started'
    end

    def prepare_payload
      ctx = self.ctx || {}
      {
        assessment: {
          id: ctx[:assessment]&.id,
          name: ctx[:assessment]&.name
        },
        evaluator: {
          id: ctx[:evaluator]&.id,
          name: ctx[:evaluator]&.decorate&.full_name
        }
      }
    end
  end
end
