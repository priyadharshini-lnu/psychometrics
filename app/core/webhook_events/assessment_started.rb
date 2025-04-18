# frozen_string_literal: true

module WebhookEvents
  class AssessmentStarted < WebhookEvents::Base
    attribute :assessment, type: Hash
    attribute :evaluator, type: Hash

    def event_name
      'assessment_started'
    end

    def prepare_payload # rubocop:disable Metrics/CyclomaticComplexity,Metrics/PerceivedComplexity
      ctx = self.ctx || {}
      {
        assessment: {
          id: ctx[:assessment]&.id,
          name: ctx[:assessment]&.name
        },
        evaluator: {
          id: ctx[:evaluator]&.id,
          name: ctx[:evaluator]&.decorate&.full_name,
          email: ctx[:evaluator]&.email,
          user_external_id: ctx[:evaluator]&.external_id,
          campaign_user_external_id: ctx[:evaluator]&.campaign_user_external_id(ctx[:campaign]&.id)
        }
      }
    end
  end
end
