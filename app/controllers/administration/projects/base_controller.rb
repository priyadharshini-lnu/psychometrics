# frozen_string_literal: true

module Administration
  module Projects
    class BaseController < Administration::BaseController
      before_action :ensure_project

      def project
        @project ||= policy_scope(Client).find(params[:project_id])
      end

      def client
        project.client
      end

      def ensure_project
        project || raise(Pundit::NotAuthorizedError)
      end
    end
  end
end
