module Services
  module ExportCSV
    class CommunicationEmailsHistory
      include Interactor

      before :set_instances

      HEADERS = ['First Name', 'Last Name', 'Email', 'Sent At'].freeze

      def call
        data = @communication.emails.sent.joins(membership: [:user]).pluck(
          'users.first_name', 'users.last_name', 'users.email', :sent_at
        )
        context.result = generate_csv(data)
      end

      private

      def generate_csv(data)
        CSV.generate(col_sep: @col_sep) do |csv|
          csv << HEADERS
          data.each do |info|
            csv << info
          end
        end
      end

      def set_instances
        @col_sep = context.col_sep
        @communication = context.communication
      end
    end
  end
end
