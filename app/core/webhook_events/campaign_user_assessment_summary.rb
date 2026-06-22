# frozen_string_literal: true

module WebhookEvents
  class CampaignUserAssessmentSummary < WebhookEvents::Base
    attribute :assessments, type: Array

    def event_name
      'campaign_user_assessment_summary'
    end

    def prepare_payload
      ctx = self.ctx || {}
      {
        assessments: Array(ctx[:assessments]).map do |assessment|
          {
            id: assessment[:id],
            name: assessment[:name],
            status: assessment[:status],
            tags: assessment[:tags]
          }
        end
      }
    end
  end
end
