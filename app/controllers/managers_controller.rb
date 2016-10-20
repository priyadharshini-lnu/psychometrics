class ManagersController < ApplicationController
  prepend_before_action :set_resource_class
  append_before_action :pundit_authorize
  layout 'users'

  def dashboard

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

  def pundit_user
    CurrentContext.new(current_user, @current_client)
  end
end
