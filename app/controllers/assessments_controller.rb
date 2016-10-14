class AssessmentsController < ApplicationController
  prepend_before_action :set_resource_class
  before_action :set_resource, only: [:pass]
  append_before_action :pundit_authorize
  layout 'users'

  # TODO: add real company
  def pass
    @assign = Assign.find_by(
      assessment_id: @resource.id,
      user_id: pundit_user.user.id,
      client_id: @current_client.id
    )
    @assign.update(status: Assign.statuses['in_progress'], step: 0)
    render layout: 'empty'
  end

  def index
    @resources = policy_scope(@resource_class).all
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
    # TODO: when we remove second scope, fix line below
    CurrentContext.new(current_administrator || current_user, @current_client)
  end
end
