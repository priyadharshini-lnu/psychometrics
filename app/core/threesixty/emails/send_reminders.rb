# frozen_string_literal: true

module Threesixty
  module Emails
    class SendReminders < BaseCommand
      private_attr_reader :threesixty_campaign

      def call
        Threesixty::EmailTemplate.reminders.each do |email_template|
          begin
            Threesixty::Emails::SendSingleReminder.call!(email_template)
          rescue => exception
            byebug
            Raven.capture_exception(exception)
          end
        end
      end
    end
  end
end
