module Api
  module V1
    class ProjectScopeController < BaseController

      def project
        @project ||= current_client.projects.find(params[:project_id])
      end
    end
  end
end
