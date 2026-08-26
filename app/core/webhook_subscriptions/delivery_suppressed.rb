# frozen_string_literal: true

module WebhookSubscriptions
  # Decides, at final delivery time, whether an outbound webhook event must be suppressed.
  #
  # This is evaluated immediately before the event leaves the platform (both the queued
  # WebhookSystemJob path and the synchronous PushWebhook path), so a campaign whose
  # `disable_webhooks` flag was toggled on *after* an event was enqueued still gets blocked.
  #
  # Precedence:
  #   1. campaign_options.disable_webhooks == true  -> suppress (reason: campaign_disable_webhooks)
  #   2. subject user is_uat == true                -> suppress (reason: uat_user)
  #   3. otherwise                                  -> deliver
  #
  # The serialized event already carries the campaign and subject ids under `data`, so no
  # change to the event payload is required.
  class DeliverySuppressed < BaseCommand
    private_attr_reader :event

    def initialize(event)
      @event = event || {}
    end

    def call
      reason = suppression_reason
      log_suppression(reason) if reason

      broadcast :ok, reason.present?
    end

    def self.suppressed?(event)
      call!(event)
    end

    private

    def suppression_reason
      return :campaign_disable_webhooks if campaign_webhooks_disabled?
      return :uat_user if uat_subject?

      nil
    end

    def campaign_webhooks_disabled?
      return false if campaign_id.blank?

      campaign = Campaign.find_by(id: campaign_id)
      return true if campaign.nil? # fail closed: unresolved campaign must not deliver externally

      campaign.disable_webhooks?
    end

    def uat_subject?
      return false if subject_id.blank?

      User.find_by(id: subject_id)&.is_uat? || false
    end

    def campaign_id
      event.dig('data', 'campaign', 'id')
    end

    def subject_id
      event.dig('data', 'subject', 'id')
    end

    def log_suppression(reason)
      Rails.logger.info(
        '[WebhookSubscriptions::DeliverySuppressed] suppressed webhook delivery ' \
        "reason=#{reason} event=#{event['event_name']} campaign_id=#{campaign_id.inspect} " \
        "subject_id=#{subject_id.inspect}"
      )
    end
  end
end
