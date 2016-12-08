module Managers
  class StatisticsController < BaseController
    prepend_before_action :set_resource_class
    append_before_action :pundit_authorize

    def index
      @filter_form = policy_scope(@resource_class).search(params[:q])
      @resources = @filter_form.
                   result.
                   joining { assessment }.
                   selecting { ['COUNT(CASE WHEN assigns.status = 0 THEN 1 ELSE null END) AS new_count',
                                'COUNT(CASE WHEN assigns.status = 1 THEN 1 ELSE null END) AS in_progress_count',
                                'COUNT(CASE WHEN assigns.status = 2 THEN 1 ELSE null END) AS completed_count',
                                assessment.name,
                                assessment_id.as('id')] }.
                   grouping { [assessment_id, assessment.name] }
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
