class ReportsController < ApplicationController
  prepend_before_action :set_resource_class
  before_action :set_resource, only: [:show]
  append_before_action :pundit_authorize
  layout 'users'

  def show
    @results = Assign.completed.where(client_id: @current_client.id, assessment_id: @resource.assessment_id).all
  end

  private

  # Set model
  def set_resource_class
    @resource_class ||= Report
  end

  def set_resource
    @resource = @resource_class.find(params[:id])
  end

  # Authorisation user
  def pundit_authorize
    authorize @resource || @resource_class
  end
end
