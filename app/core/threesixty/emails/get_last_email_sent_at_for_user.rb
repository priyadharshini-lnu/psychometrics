# frozen_string_literal: true

module Threesixty
  module Emails
    class GetLastEmailSentAtForUser < BaseCommand
      private_attr_accessor :threesixty_campaign, :email_name, :user_id

      def initialize(threesixty_campaign, email_name, user_id)
        @threesixty_campaign = threesixty_campaign
        @email_name = email_name
        @user_id = user_id
      end

      def call
        email_schedules = threesixty_campaign.email_schedules.where(name: email_name)
        last_email_sent_date = Threesixty::EmailHistory.where(
          threesixty_email_schedule_id: email_schedules, subject_id: user_id
        ).last&.created_at

        broadcast :ok, last_email_sent_date
      end
    end
  end
end
