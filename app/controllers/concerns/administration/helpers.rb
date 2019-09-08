# frozen_string_literal: true

module Administration
  module Helpers
    extend ActiveSupport::Concern

    included do
      helper_method :i18n
      helper_method :client, :project, :campaign, :resource, :resources, :resource_class, :filter_form
      helper_method :membership, :project_membership, :project_assign
      helper_method :user, :users
    end

    def i18n
      nil
    end

    def client
      @_client ||= if params[:client_id]
                     policy_scope(Client).find(params[:client_id])
                   else
                     resource.client
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

    def filter_form
      @_filter_form
    end

    def membership
      @_membership
    end

    def project_membership
      @_project_membership ||= membership.project_membership || membership
    end

    def assign
      @assign
    end

    def project_assign
      @_project_assign ||= assign.project_assign || assign
    end

    def user
      @_user
    end

    def users
      @_users
    end
  end
end
