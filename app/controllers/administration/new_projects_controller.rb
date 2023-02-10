# frozen_string_literal: true

module Administration
  class NewProjectsController < Administration::BaseController
    include ::ProjectInitialState

    helper_method :project

    prepend_before_action :set_resource_class
    before_action :set_resource
    before_action :set_project_init_state, only: :show
    append_before_action :pundit_authorize

    def show
      render json: @init_state
    end

    private

    def project
      @project = @_resource
    end

    def set_resource
      @_resource = policy_scope(Client).find(params[:id])
    end

    def set_resource_class
      @_resource_class ||= Client # rubocop:disable Naming/MemoizedInstanceVariableName
    end
  end
end
