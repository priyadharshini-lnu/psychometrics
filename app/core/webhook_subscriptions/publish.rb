# frozen_string_literal: true

module WebhookSubscriptions
  class Publish < BaseCommand
    private_attr_accessor :project, :event_name, :data

    EVENTS = {
      assessment_started: WebhookEvents::AssessmentStarted,
      assessment_completed: WebhookEvents::AssessmentCompleted,
      assessment_timeout: WebhookEvents::AssessmentTimeout,
      results_available: WebhookEvents::ResultsAvailable,
      report_available: WebhookEvents::ReportAvailable
    }.freeze

    def initialize(project, event_name, data)
      @project = project
      @event_name = event_name
      @data = data
    end

    def call
      return broadcast(:ok) unless project.webhook_subscription

      event = EVENTS[event_name].call(data.merge(project: project, client: project.parent))

      WebhookSystemJob.perform_later(project.webhook_subscription, event.as_json)
      broadcast(:ok)
    end
  end
end
