module Administration
  module Helpers
    extend ActiveSupport::Concern

    included do
      helper_method :client, :project, :campaign, :resource
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
        client.project
      end
    end

    def campaign
      @_campaign ||= if params[:campaign_id]
        policy_scope(Client).find(params[:campaign_id])
      else
        client.campaign
      end
    end

    def resource
      @resource ||= @resource_class.new
    end
  end
end
