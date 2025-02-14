# frozen_string_literal: true

module WebhookSubscriptions
  class Publish < BaseCommand
    private_attr_accessor :project, :event_name, :data, :webhook, :record

    EVENT_TO_WEBHOOK_MAPPING = {
      assessment_started: UserAssessments::Webhook,
      assessment_completed: UserAssessments::Webhook,
      assessment_assigned: UserAssessments::Webhook,
      scheduling_scheduled: WorkshopSubjects::Webhook,
      scheduling_cancelled: WorkshopSubjects::Webhook,
      scheduling_rescheduled: WorkshopSubjects::Webhook,
      scheduling_invited: WorkshopInvites::Webhook
    }.freeze

    def initialize(project, event_name, data, webhook_id: nil, record: nil)
      @project = project
      @event_name = event_name
      @data = data
      @record = record
      @webhook = webhook_id && Webhook.active.not_deleted.find(webhook_id)
    end

    def call
      return broadcast(:ok) unless project.webhooks.active.not_deleted.exists? || webhook

      if webhook
        push_to_single_webhook
      else
        push_to_project_webhooks
      end
    end

    private

    def push_to_single_webhook
      response = Administration::Webhooks::PushWebhook.call(webhook, event_as_json(webhook))
      response[:error] ? broadcast(:error, response[:error]) : broadcast(:ok)
    end

    def push_to_project_webhooks
      project.webhooks.active.not_deleted.includes(:topics).each do |webhook|
        next unless webhook.topics.pluck(:name).include?(event_name.to_s)

        WebhookSystemJob.perform_later(webhook, event_as_json(webhook))
      end
      broadcast(:ok)
    end

    def event_as_json(webhook)
      event = Webhook::EVENTS[event_name].call(data.merge(project: project, client: project.parent))

      if webhook.include_locales && record.present?
        event[:locale] = localized_data
        event.as_json
      else
        event.as_json.tap { |event_data| event_data['data'].delete('locale') }
      end
    end

    def localized_data
      EVENT_TO_WEBHOOK_MAPPING[event_name].new(record).prepare_localized_webhook_data
    end
  end
end
