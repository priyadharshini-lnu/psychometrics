# frozen_string_literal: true

module WebhookSubscriptions
  class Publish < BaseCommand
    private_attr_accessor :project, :event_name, :data, :webhook, :record

    EVENT_TO_WEBHOOK_MAPPING = {
      assessment_started: UserAssessments::Webhook,
      assessment_completed: UserAssessments::Webhook,
      assessment_timeout: UserAssessments::Webhook,
      assessment_assigned: UserAssessments::Webhook,
      scheduling_scheduled: WorkshopSubjects::Webhook,
      scheduling_cancelled: WorkshopSubjects::Webhook,
      scheduling_rescheduled: WorkshopSubjects::Webhook,
      scheduling_invited: WorkshopInvites::Webhook,
      workshop_attendance_status: WorkshopSubjects::Webhook,
      assessment_raw_response: UserAssessments::Webhook,
      campaign_user_assessment_summary: UserAssessments::Webhook
    }.freeze

    def initialize(project, event_name, data, webhook_id: nil, record: nil)
      @project = project
      @event_name = event_name
      @data = data
      @record = record
      @webhook = webhook_id && Webhook.active.not_deleted.find(webhook_id)
    end

    def call
      return broadcast(:ok) if uat_event?
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
      project.webhooks.active.not_deleted.includes(:topics).find_each do |webhook|
        next unless webhook.topics.pluck(:name).include?(event_name.to_s)

        next if should_filter_by_assessment?(webhook)

        WebhookSystemJob.perform_later(webhook.id, event_as_json(webhook))
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

    def should_filter_by_assessment?(webhook)
      return false unless event_name.to_sym == :assessment_raw_response

      return false if webhook.assessment_ids.blank?

      assessment = @data[:assessment] || @record&.assessment
      return true unless assessment

      webhook.assessment_ids.exclude?(assessment.id.to_s)
    end

    def uat_event?
      users_from_event.any?(&:is_uat?)
    end

    def users_from_event
      users = []

      users << record if record.is_a?(User)
      users << record.user if record.respond_to?(:user)
      users << record.subject if record.respond_to?(:subject)
      users << record.evaluator if record.respond_to?(:evaluator)

      users += %i[subject user evaluator].filter_map do |key|
        value = data[key] || data[key.to_s]
        value if value.is_a?(User)
      end

      users.compact.uniq
    end
  end
end
