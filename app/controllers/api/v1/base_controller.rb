module Api
  module V1
    class BaseController < ActionController::Base
      before_action :auth

      rescue_from Errors::ApiError, with: :render_error

      def auth
        @api_key = api_key
        raise Errors::ApiError, "Api key is not correct" unless api_key
      end

      def api_key
        @api_key ||= ApiKey.active.find_by(token: request.headers['X-Api-Key'])
      end

      def current_user
        @current_user ||=
          begin
            u = api_key.user
            raise Errors::ApiError, "User for api token not found" if u.nil? || u.disabled
            u
          end
      end

      def current_client
        @current_client ||= api_key&.membership&.client
      end

      def user
        @user ||=
          begin
            user_id = params[:user_id] || params[:id]
            u = ::Users::Regular.find_by(project_id: params[:project_id], id: user_id)
            raise Errors::ApiError, "User with id=#{user_id} is not found" unless u
            u
          end
      end

      def project
        @project ||=
          begin
            if current_user.superadmin?
              Client.projects.find_by(id: params[:project_id])
            else
              memberships = current_user.memberships
              project_admin_memberships = memberships.select(&:role_project_admin?)
              client_admin_memberships = memberships.select(&:client_project_admin?)
              project_ids = project_admin_memberships.map(&:client_id)
              client_ids = client_admin_memberships.map(&:client_id)
              binding.pry
              p = Client.projects.where(id: project_ids, ansestry: client_ids).find_by(id: params[:project_id])
              raise Errors::ApiError, "Project with id=#{params[:project_id]} is not found" unless p
              p
            end
          end
      end

      def project_membership
        user.project_membership
      end

      def render_form_errors(form)
        render json: { errors: form.errors }, status: :bad_request
      end

      def render_error(e)
        render json: { errors: [e.message] }, status: :forbidden
      end
    end
  end
end
