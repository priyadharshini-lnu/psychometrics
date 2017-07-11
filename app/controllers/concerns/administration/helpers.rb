module Administration
  module Helpers
    extend ActiveSupport::Concern

    included do
      helper_method :i18n
      helper_method :client, :project, :campaign, :resource, :resources, :resource_class, :membership, :project_membership, :filter_form
    end

    def i18n
      nil
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
      @_resource || resource_class.new
    end

    def resources
      @_resources
    end

    def resource_class
      @_resource_class
    end

    def membership
      @_membership
    end

    def project_membership
      @_project_membership ||= membership.project_membership || membership
    end

    def filter_form
      @_filter_form
    end
  end
end
