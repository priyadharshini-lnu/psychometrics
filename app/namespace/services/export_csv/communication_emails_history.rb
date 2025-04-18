# frozen_string_literal: true

require 'csv-safe'

module Services
  module ExportCsv
    class CommunicationEmailsHistory
      include Interactor

      before :set_instances

      HEADERS = ['First Name', 'Last Name', 'Email', 'Sent At'].freeze

      def call
        query = @communication.emails.sent
        query = @communication.campaign_id? ? query.joins(campaign_user: :user) : query.joins(:user)
        data = query.pluck('users.first_name', 'users.last_name', 'users.email', :sent_at)

        context.result = generate_csv(data)
      end

      private

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
