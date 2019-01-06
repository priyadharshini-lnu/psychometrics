module Api
  module V1
    class ProjectScopeController < BaseController

      def project
        @project ||=
          begin
            p = current_client.projects.find_by(id: params[:project_id])
            raise Errors::ApiError, "Project with id=#{params[:project_id]} is not found" unless p
            p
          end
      end
    end
  end
end
