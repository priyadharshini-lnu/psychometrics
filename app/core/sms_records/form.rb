# frozen_string_literal: true

module SmsRecords
  class Form < Rectify::Form
    attribute :message, String
    attribute :filters, Hash
    attribute :link_expiry, DateTime

    validates :link_expiry, :message, presence: true
    validate :client_sms_notification_enabled

    def client_sms_notification_enabled
      return if context.client.sms_notification?

      errors.add(:base, :client_sms_notification_disabled)
    end
  end
end
