# frozen_string_literal: true

module Managers
  class TasksController < BaseController
    prepend_before_action :set_resource_class
    before_action :set_resource, only: %i[edit update destroy show change_status]
    before_action :set_assessment
    append_before_action :set_managers, only: %i[index edit new update create]
    append_before_action :set_factors, only: %i[edit new update create]
    append_before_action :pundit_authorize
    helper_method :status_percent

    def index
      @filter_form = policy_scope(@resource_class).roots.includes(:factor, membership: [:user]).
                     where(
                       assessment_id: @assessment.id,
                       membership_id: @managers.pluck(:id),
                       owner_id: @current_membership.id
                     ).
                     references(:membership).search(params[:q])
      @resources   = @filter_form.result
      @tasks = Task.roots.joins(:membership).
               where(
                 assessment_id: @assessment.id,
                 membership_id: @managers.pluck(:id),
                 owner_id: @current_membership.id
               ).all
      @tasks_by_status = Task.group_by_status(@tasks)
      @managers_tasks_by_status = @managers.each_with_object({}) do |manager, hash|
        tasks = @tasks.select { |task| task.membership_id == manager.id }
        hash[manager.id] = Task.group_by_status(tasks)
      end
      respond_to do |format|
        format.html
        format.js { render :index, formats: [:js] }
      end
    end

    def new
      @resource = @assessment.tasks.new
      @resource.parent_id = params[:parent_id]
      @resource.priority = params[:priority]
    end

    def change_status
      status = Task.statuses.key(resource_params[:status].to_i)
      @resource.update(status: status) if status
    end

    def destroy
      @resource.destroy
      respond_to do |format|
        format.js
      end
    end

    def create
      @resource = @assessment.tasks.new(resource_params)
      @resource.owner = @current_membership
      respond_to do |format|
        if @resource.save
          # TODO: This is huck, used to collapse tasks (I need to fast solution)
          flash[:task_id_collapse] = @resource.parent_id if @resource.parent_id
          format.js
        else
          format.js { render :new }
        end
      end
    end

    def update
      respond_to do |format|
        if @resource.update(resource_params)
          format.js
        else
          format.js { render :edit }
        end
      end
    end

    def status_percent(status)
      return 0 if @tasks.empty?

      (@tasks_by_status[status].try(:size) || 0) * 100 / @tasks.size
    end

    private

    # Set model
    def set_resource_class
      @resource_class ||= Task
    end

    # Authorisation user
    def pundit_authorize
      authorize @resource || @resource_class
    end

    def resource_params
      params.require(:resource).permit(:name, :description, :priority, :membership_id,
                                       :status, :factor_id, :planned_completed_at, :parent_id)
    end

    def set_resource
      @resource = @resource_class.find(params[:id])
    end

    def set_assessment
      @assessment = Assessment.find(params[:assessment_id])
    end

    def set_factors
      @factors = Factor.where(dimension_id: Assessment.first.dimension.id).order(name: :asc).all
    end

    def set_managers
      resource_ids = [@current_membership.id]
      resource_ids << @current_membership.children.includes(:user).pluck(:id)
      @managers = Membership.includes(:user).where(id: resource_ids.flatten).all
    end
  end
end
