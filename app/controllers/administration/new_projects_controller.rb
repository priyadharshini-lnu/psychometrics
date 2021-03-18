# frozen_string_literal: true

module Administration
  class NewProjectsController < Administration::BaseController
    include ::ProjectInitialState

    helper_method :project

    prepend_before_action :set_resource_class
    before_action :set_resource
    append_before_action :pundit_authorize
    initial_state_for %i[show]

    def show; end

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
