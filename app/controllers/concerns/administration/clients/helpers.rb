module Administration
  module Clients
    module Helpers
      extend ActiveSupport::Concern

      included do
        helper_method :client
      end

      def client
        @_client ||= policy_scope(Client).find(params[:client_id])
      end
    end
  end
end
