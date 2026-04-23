# frozen_string_literal: true

module WebhookEvents
  class SchedulingRescheduled < WebhookEvents::Base
    attribute :invite, type: Hash
    attribute :rescheduled_to_workshop, type: Hash
    attribute :rescheduled_from_workshop, type: Hash

    def event_name
      'scheduling_rescheduled'
    end

    def prepare_payload
      ctx = self.ctx || {}
      {
        invite: {
          id: ctx[:invite]&.id,
          title: ctx[:invite]&.title,
          description: ctx[:invite]&.description,
          url: ctx[:invite]&.end_user_url,
          rescheduling_type: ctx[:rescheduling_type]
        },
        rescheduled_to_workshop: workshop_payload(ctx[:rescheduled_to_workshop]),
        rescheduled_from_workshop: workshop_payload(ctx[:rescheduled_from_workshop])
      }
    end

    private

    def workshop_payload(workshop)
      {
        id: workshop&.id,
        name: workshop&.name,
        start_time: workshop&.start_time&.as_json,
        end_time: workshop&.end_time&.as_json
      }
    end
  end
end
