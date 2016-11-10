module Managers
  class AssignsController < BaseController
    prepend_before_action :set_resource_class
    append_before_action :pundit_authorize

    def index
      @filter_form = policy_scope(@resource_class).
                     includes(:assessment, :user).
                     joining { assessment }.
                     where.has { assessment.disabled.eq(nil) | assessment.disabled.eq(false) }.
                     search(params[:q])
      @reports = @current_client.reports.enabled.
                 with_assessment_category(%w(360 organisational)).
                 available_to_view.
                 group_by(&:assessment_id)
      # TODO: implement scope
      @resources = @filter_form.result
      respond_to do |format|
        format.html
        format.js { render :index, formats: [:js] }
      end
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
