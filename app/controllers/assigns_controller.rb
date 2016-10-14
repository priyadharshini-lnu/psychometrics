class AssignsController < ApplicationController
  prepend_before_action :set_resource_class
  before_action :set_resource, only: [:update]
  append_before_action :pundit_authorize
  skip_before_action :verify_authenticity_token

  layout false

  def update
    @resource.assign_attributes(resource_params)
    @resource.step += 1
    if @resource.completed?
      @resource.calculate_scoring
      @resource.completed_at = Time.now
    end
    @resource.save
    head :no_content
  end

  private

  # Set model
  def set_resource_class
    @resource_class ||= Assign
  end

  def set_resource
    @resource = @resource_class.find(params[:id])
  end

  def resource_params
    results       = params.require(:resource).fetch(:results, nil).try(:permit!)
    embedded_data = params.require(:resource).fetch(:embedded_data, nil).try(:permit!)
    params.require(:resource).permit(:step, :status).merge(results: results, embedded_data: embedded_data)
  end

  # Authorisation user
  def pundit_authorize
    authorize @resource || @resource_class
  end
end
