class AssessmentsController < ApplicationController
  prepend_before_action :set_resource_class
  before_action :set_resource, only: [:pass]
  append_before_action :pundit_authorize

  # TODO: add real company
  def pass
    @result = Result.find_or_create_by(
        assessment_id: @resource.id,
        user_id: pundit_user.id,
        client_id: pundit_user.clients[0].id
    )
    @result.update(status: Result.statuses['in_progress'])
    render layout: 'empty'
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
