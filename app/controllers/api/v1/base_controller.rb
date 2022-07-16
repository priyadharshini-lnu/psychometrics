# frozen_string_literal: true

module Api
  module V1
    class BaseController < ActionController::Base
      include Pundit

      before_action :auth
      before_action :ensure_project
      before_action :pundit_authorize
      skip_before_action :verify_authenticity_token
      prepend AuditLogModule::ControllerHelper

      rescue_from Api::Errors::ApiError, with: :render_error
      rescue_from Pundit::NotAuthorizedError, with: :render_not_authorized_error

      def auth
        @api_key      = fetch_api_key
        @current_user = api_key&.user
        raise Api::Errors::InvalidAuthentication unless api_key
        raise Api::Errors::InvalidAuthentication, 'API User is disabled' if @current_user&.disabled
      end

      attr_reader :current_user, :api_key

      def user
        @user ||=
          begin
            user_id = params[:user_id] || params[:id]
            u       = ::Users::Regular.find_by(project_id: project.id, id: user_id)
            raise Api::Errors::ResourceNotFound, "User with id=#{user_id} was not found" unless u

            u
          end
      end

      def project
        @project ||= policy_scope(
          Client, policy_scope_class: ::Administration::ClientPolicy::Scope
        ).find_by(id: project_id)
      end

      def ensure_project
        project || raise(Api::Errors::ResourceNotFound, "Project with id=#{project_id} was not found")
      end

      def project_id
        params[:project_id] || params[:id]
      end

      def project_membership
        user.project_membership
      end

      def render_validation_errors(form)
        raise Api::Errors::ValidationFailed, form.errors.full_messages.first
      end

      def render_error(e)
        render json: { code: e.code, message: e.message, more_info: e.more_info, meta: e.meta }, status: e.status
      end

      def render_not_authorized_error
        e = Api::Errors::Unauthorized.new
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
