# frozen_string_literal: true

module Administration
  module Projects
    class BaseController < Administration::BaseController
      skip_after_action :verify_policy_scoped, only: %i[index show]
      append_before_action :pundit_authorize
      before_action :ensure_project

      def project
        @project ||= policy_scope(Client).find(params[:project_id])
      end

      def client
        project.client
      end

      def campaign
        @campaign ||= Campaign.find(params[:new_campaign_id])
      end

      def resource_params
        params.require(:resource)
      end

      def ensure_project
        project || raise(Pundit::NotAuthorizedError)
      end
    end
  end
end
