class ResultsController < ApplicationController
  prepend_before_action :set_resource_class
  before_action :set_resource, only: [:update]
  append_before_action :pundit_authorize
  skip_before_action :verify_authenticity_token

  layout false

  def update
    @resource.assign_attributes(resource_params)
    @resource.step += 1
    @resource.calculate_scoring if @resource.complete?
    @resource.save
    Rails.logger.warn "errors #{@resource.errors.inspect}"
    head :no_content
  end

  private

  # Set model
  def set_resource_class
    @resource_class ||= Result
  end

  def set_resource
    @resource = @resource_class.find(params[:id])
  end

  def resource_params
    props         = params.require(:resource).fetch(:props, nil).try(:permit!)
    embedded_data = params.require(:resource).fetch(:embedded_data, nil).try(:permit!)
    params.require(:resource).permit(:step, :status).merge(props: props, embedded_data: embedded_data)
  end

  # Authorisation user
  def pundit_authorize
    authorize @resource || @resource_class
  end
end
