module Administration
  module Clients
    module Helpers
      extend ActiveSupport::Concern

      included do
        helper_method :client, :project, :campaign
      end

      def client
        @_client ||= if params[:client_id]
                       policy_scope(Client).find(params[:client_id])
                     else
                       @resource.client
                     end
      end

      def project
        @_project ||= if params[:project_id]
                        policy_scope(Client).find(params[:project_id])
                      else
                        @resource.project
                      end
      end

      def campaign
        @_campaign ||= policy_scope(Client).find(params[:campaign_id])
      end
    end
  end
end
