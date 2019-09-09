# frozen_string_literal: true

module Managers
  class CommentsController < BaseController
    prepend_before_action :set_resource_class
    before_action :set_task, only: [:create]
    append_before_action :pundit_authorize

    def create
      @resource = @task.comments.new(resource_params)
      @resource.creator = current_user
      respond_to do |format|
        format.js if @resource.save
      end
    end

    private

    # Set model
    def set_resource_class
      @resource_class ||= Comment # rubocop:disable Naming/MemoizedInstanceVariableName
    end

    # Authorisation user
    def pundit_authorize
      authorize @resource || @resource_class
    end

    def resource_params
      params.require(:resource).permit(:text)
    end

    def set_task
      @task = Task.find(params[:task_id])
    end
  end
end
