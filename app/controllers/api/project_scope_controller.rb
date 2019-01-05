module Api
  class ProjectScopeController < BaseController

    def project
      @project ||= Client.projects.find(params[:project_id])
    end
  end
end
