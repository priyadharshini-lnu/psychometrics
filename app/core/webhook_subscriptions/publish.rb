# frozen_string_literal: true

module WebhookSubscriptions
  class Publish < BaseCommand
    private_attr_accessor :project, :event_name, :data, :webhook

    def initialize(project, event_name, data, webhook_id = nil)
      @project = project
      @event_name = event_name
      @data = data
      @webhook = webhook_id && Webhook.active.not_deleted.find(webhook_id)
    end

    def call
      return broadcast(:ok) unless project.webhooks.active.not_deleted.exists? || webhook

      event = Webhook::EVENTS[event_name].call(data.merge(project: project, client: project.parent))

      if webhook
        response = Administration::Webhooks::PushWebhook.call(webhook, event.as_json)
        response[:error] ? broadcast(:error, response[:error]) : broadcast(:ok)
      else
        project.webhooks.active.not_deleted.includes(:topics).each do |webhook|
          if webhook.topics.pluck(:name).include?(event_name.to_s)
            WebhookSystemJob.perform_later(webhook, event.as_json)
          end
        end
        broadcast(:ok)
      end
    end
  end
end
