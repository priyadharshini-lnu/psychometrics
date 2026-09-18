# frozen_string_literal: true

require 'csv-safe'

module Services
  module ExportCsv
    class CommunicationEmailsHistory
      include Interactor

      before :set_instances

      HEADERS = ['First Name', 'Last Name', 'Recipient Email', 'Subject Email', 'CC Recipients', 'Sent At'].freeze

      def call
        query = @communication.emails.sent

        cc_recipients = @communication.cc_users.pluck(:email).join(', ')

        data = recipient_data(query, cc_recipients)

        context.result = generate_csv(data)
      end

      private

      def recipient_data(query, cc_recipients)
        query.preload(:user, campaign_user: :user).map do |email|
          recipient = email.user || email.campaign_user&.user
          subject_email = email.campaign_user&.user&.email

          [
            recipient.first_name, recipient.last_name, recipient.email, subject_email, cc_recipients, email.sent_at
          ]
        end
      end

      def generate_csv(data)
        CSVSafe.generate(**@csv_options) do |csv|
          csv << HEADERS
          data.each do |info|
            csv << info
          end
        end
      end

      def set_instances
        @csv_options = context.csv_options || {}
        @communication = context.communication
      end
    end
  end
end
