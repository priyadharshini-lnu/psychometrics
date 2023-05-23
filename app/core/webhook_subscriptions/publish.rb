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
      return broadcast(:ok) unless project.webhooks.not_deleted.exists?

      event = EVENTS[event_name].call(data.merge(project: project, client: project.parent))

      project.webhooks.not_deleted.includes(:topics).each do |webhook|
        if webhook.topics.pluck(:name).include?(event_name.to_s)
          WebhookSystemJob.perform_later(webhook, event.as_json)
        end
      end

      broadcast(:ok)
    end
  end
end
