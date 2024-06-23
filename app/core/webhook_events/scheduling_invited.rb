# frozen_string_literal: true

module WebhookEvents
  class SchedulingInvited < WebhookEvents::Base
    attribute :invite, type: Hash
    attribute :workshops, type: Array
    attribute :subject, type: Hash
    attribute :locale, type: Hash

    def event_name
      'scheduling_invited'
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
        workshops: ctx[:workshops]
      }
    end
  end
end
