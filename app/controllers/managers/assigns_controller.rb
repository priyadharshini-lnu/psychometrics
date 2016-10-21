module Managers
  class AssignsController < BaseController
    prepend_before_action :set_resource_class
    append_before_action :pundit_authorize

    def index
      @reports = @current_client.reports.group_by(&:assessment_id)
      # TODO: implement scope
      @resources = policy_scope(@resource_class).order(:id).all
    end

    private
    # Set model
    def set_resource_class
      @resource_class ||= Assign
    end

    def set_resource
      @resource = @resource_class.find(params[:id])
    end

    # Authorisation user
    def pundit_authorize
      authorize @resource || @resource_class
    end
  end
end
