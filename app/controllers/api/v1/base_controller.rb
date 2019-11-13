# frozen_string_literal: true

module Api
  module V1
    class BaseController < ActionController::Base
      before_action :auth

      rescue_from Errors::ApiError, with: :render_error

      def auth
        @api_key      = fetch_api_key
        @current_user = api_key&.user
        raise Errors::Api::AuthError unless api_key
        raise Errors::Api::AuthError, 'User for api token is disabled' if @current_user&.disabled
      end

      attr_reader :current_user, :api_key

      def user
        @user ||=
          begin
            user_id = params[:user_id] || params[:id]
            u       = ::Users::Regular.find_by(project_id: params[:project_id], id: user_id)
            raise Errors::Api::ResourceNotFoundError, "User with id=#{user_id} is not found" unless u

            u
          end
      end

      def project
        @project ||=
          begin
            p =
              if current_user.superadmin?
                Client.projects.find_by(id: params[:project_id])
              else
                memberships = current_user.memberships
                project_ids = memberships.select(&:project_admin?).map(&:client_id)
                client_ids  = memberships.select(&:client_admin?).map(&:client_id)
                Client.projects.
                  where.
                  has { (id.in project_ids) | (ancestry.in client_ids) }.find_by(id: params[:project_id])
              end

            raise Errors::Api::ResourceNotFoundError, "Project with id=#{params[:project_id]} is not found" unless p

            p
          end
      end

      def project_membership
        user.project_membership
      end

      def render_validation_errors(form)
        raise Errors::Api::ValidationError, form.errors.full_messages.first
      end

      def render_error(e)
        render json: { code: e.code, message: e.message, more_info: e.more_info, meta: e.meta }, status: e.status
      end

      # Fetches API key
      #
      def fetch_api_key
        authenticate_with_http_basic do |key, token|
          possible_api_key = ApiKey.active.find_by(key: key)
          return nil if possible_api_key.nil? || possible_api_key.token != token

          possible_api_key
        end
      end
    end
  end
end
