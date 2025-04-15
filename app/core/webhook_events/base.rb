# frozen_string_literal: true

module WebhookEvents
  class Base < WebhookSystem::BaseEvent
    attribute :subject, type: Hash
    attribute :project, type: Hash
    attribute :client, type: Hash
    attribute :campaign, type: Hash
    attribute :ctx, type: Hash
    attribute :event_time, type: DateTime
    attribute :locale, type: Hash

    def self.call(ctx)
      event = new(ctx: ctx)
      data = event.prepare_payload.merge(event.common_attrs)
      build(data)
    end

    def common_payload_attrs
      common_attrs.keys
    end

    def payload_attributes
      prepare_payload.keys + common_payload_attrs
    end

    def common_attrs # rubocop:disable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
      ctx = self.ctx || {}
      {
        subject: {
          id: ctx[:subject]&.id,
          name: ctx[:subject]&.decorate&.full_name,
          email: ctx[:subject]&.email,
          campaign_user_external_id: ctx[:subject]&.campaign_user_external_id(ctx[:campaign]&.id),
          user_external_id: ctx[:subject]&.external_id
        },
        project: {
          id: ctx[:project]&.id,
          name: ctx[:project]&.name
        },
        client: {
          id: ctx[:client]&.id,
          name: ctx[:client]&.name
        },
        campaign: {
          id: ctx[:campaign]&.id,
          name: ctx[:campaign]&.name
        },
        locale: ctx[:locale],
        event_time: DateTime.now
      }
    end

    def prepare_payload
      raise 'to be implemented'
    end
  end
end
