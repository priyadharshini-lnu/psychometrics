# frozen_string_literal: true

module WebhookEvents
  class SchedulingCancelled < WebhookEvents::Base
    attribute :invite, type: Hash
    attribute :workshop, type: Hash

    def event_name
      'scheduling_cancelled'
    end

    def prepare_payload
      ctx = self.ctx || {}
      {
        invite: {
          id: ctx[:invite]&.id,
          title: ctx[:invite]&.title,
          description: ctx[:invite]&.description,
          url: ctx[:invite]&.end_user_url
        },
        workshop: workshop_payload(ctx[:workshop])
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
