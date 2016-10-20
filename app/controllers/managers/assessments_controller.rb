module Managers
  class AssessmentsController < ApplicationController
    prepend_before_action :set_resource_class
    append_before_action :pundit_authorize
    layout 'users'


    def index
      @reports   = @current_client.reports.group_by(&:assessment_id)
      # TODO: add scope
      @resources = @current_client.assessments.order(:id).all
    end

    private

    # Set model
    def set_resource_class
      @resource_class ||= Assessment
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
