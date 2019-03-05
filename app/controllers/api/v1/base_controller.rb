# frozen_string_literal: true

module Api
  module V1
    class BaseController < ActionController::Base
      before_action :auth

      rescue_from Errors::ApiError, with: :render_error

      def auth
        @api_key      = fetch_api_key
        @current_user = api_key&.user
        raise Errors::ApiError, 'Api key is not correct' unless api_key
        raise Errors::ApiError, 'User for api token not found' if @current_user.nil? || @current_user.disabled
      end

      attr_reader :current_user, :api_key

      def user
        @user ||=
          begin
            user_id = params[:user_id] || params[:id]
            u       = ::Users::Regular.find_by(project_id: params[:project_id], id: user_id)
            raise Errors::ApiError, "User with id=#{user_id} is not found" unless u

            u
          end
      end

      def project
        @project ||=
          begin
            if current_user.superadmin?
              p = Client.projects.find_by(id: params[:project_id])
              raise Errors::ApiError, "Project with id=#{params[:project_id]} is not found" unless p

              p
            else
              memberships = current_user.memberships
              project_ids = memberships.select(&:project_admin?).map(&:client_id)
              client_ids  = memberships.select(&:client_admin?).map(&:client_id)
              p           = Client.projects.where.has { (id.in project_ids) | (ancestry.in client_ids) }.find_by(id: params[:project_id])
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

      # Fetchs API key
      #
      def fetch_api_key
        key, token = basic_auth_credentials
        possible_api_key = ApiKey.active.find_by(key: key)

        return nil if possible_api_key.nil? || possible_api_key.token != token

        possible_api_key
      end

      # Decodes credentials
      #
      def basic_auth_credentials
        auth_param = request.authorization.to_s.split(' ', 2).second
        decoded_credentials = ::Base64.decode64(auth_param || '')
        decoded_credentials.split(':', 2)
      end
    end
  end
end
