# frozen_string_literal: true

module Communications
  module Emails
    # Wraps whichever record holds a CommunicationEmail's content — a CommunicationDelivery for
    # emails created by the new communication center, a Communication for legacy ones — so downstream
    # code (mailer, render command, resources) never has to branch on communication_delivery_id.present?
    ContentSource = Struct.new(:record) do
      def self.for(communication_email)
        if communication_email.communication_delivery_id.present?
          new(communication_email.communication_delivery)
        else
          new(communication_email.communication)
        end
      end

      def subject(locale = nil)
        return record.subject if locale.nil?

        Mobility.with_locale(locale) { record.subject }
      end

      def body(locale = nil)
        return record.body if locale.nil?

        Mobility.with_locale(locale) { record.body }
      end

      delegate :kind, to: :record

      def has_arabic_translation?
        record.body(locale: :ar, fallback: false).present?
      end

      def cc_emails
        record.cc_users.pluck(:email)
      end
    end
  end
end
