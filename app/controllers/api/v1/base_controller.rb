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
        @current_user ||= api_key&.membership&.user
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

      def render_form_errors(form)
        render json: { errors: form.errors }, status: :bad_request
      end

      def render_error(e)
        render json: { errors: [e.message] }, status: :forbidden
      end
    end
  end
end
