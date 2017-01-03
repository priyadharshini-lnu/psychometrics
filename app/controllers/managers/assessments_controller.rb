module Managers
  class AssessmentsController < BaseController
    prepend_before_action :set_resource_class
    append_before_action :pundit_authorize

    def index
      @filter_form = policy_scope(@resource_class).search(params[:q])
      @resources   = @filter_form.result
      respond_to do |format|
        format.html
        format.js { render :index, formats: [:js] }
      end
    end

    private

    # Set model
    def set_resource_class
      @resource_class ||= Assessment
    end

    # Authorisation user
    def pundit_authorize
      authorize @resource || @resource_class
    end

    def resource_params
      params.require(:resource).permit(:name, :description, :priority, :membership_id, :status, :factor_id)
    end

    def set_resource
      @resource = @resource_class.find(params[:id])
    end

    def set_factors
      @factors = Factor.where(dimension_id: Assessment.first.dimension.id).order(name: :asc).all
    end
  end
end
