# frozen_string_literal: true

module WebhookEvents
  class AssessmentCompleted < AssessmentStarted
    def event_name
      'assessment_completed'
    end
  end
end
