# frozen_string_literal: true

module WebhookEvents
  class AssessmentTimeout < AssessmentStarted
    def event_name
      'assessment_timeout'
    end
  end
end
