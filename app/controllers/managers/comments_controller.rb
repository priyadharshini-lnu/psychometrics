module Managers
  class CommentsController < BaseController
    prepend_before_action :set_resource_class
    before_action :set_task, only: [:create]
    append_before_action :pundit_authorize

    def create
      @resource = @task.comments.new(resource_params)
      @resource.creator = current_user
      respond_to do |format|
        if @resource.save
          format.js
        end
      end
    end

    private

    # Set model
    def set_resource_class
      @resource_class ||= Comment
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
