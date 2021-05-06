# frozen_string_literal: true

module Hogan
  class FetchResultsJob < ApplicationJob
    queue_as :external_results
    retry_on StandardError, wait: ->(executions) { executions * 2.minutes }, attempts: 3

    def perform(user_result, credentials, project)
      Hogan::FetchResults.call(user_result, credentials, project) do
        on(:not_completed) { raise StandardError, 'Unable to fetch hogan report' }
        on(:ok) { publish_to_webhook(user_report) }
      end
    end

    def publish_to_webhook(user_report)
      user_result = user_report.user_results.first
      campaign = user_result.user_assessment.campaign

      data = {
        campaign: campaign,
        subject: user_result.subject,
        report: user_report.report,
        user_report: user_report
      }
      WebhookSubscriptions::Publish.call!(campaign.project, :report_available, data)
    end
  end
end
