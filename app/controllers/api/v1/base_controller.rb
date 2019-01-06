module Api
  module V1
    class BaseController < ActionController::Base
      before_action :auth

      def auth
        @api_key = api_key
        raise "Api key is not correct" unless api_key
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

      def render_form_errors(form)
        render json: { errors: form.errors }, status: :bad_request
      end
    end
  end
end
