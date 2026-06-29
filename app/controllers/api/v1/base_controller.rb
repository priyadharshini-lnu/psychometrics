# frozen_string_literal: true

module Api
  module V1
    class BaseController < ActionController::Base
      include Pundit

      before_action :set_request_interface
      before_action :authorize_request_ip
      before_action :auth
      before_action :ensure_project
      before_action :pundit_authorize
      skip_before_action :verify_authenticity_token
      prepend AuditLogModule::ControllerHelper

      rescue_from Api::Errors::ApiError, with: :render_error
      rescue_from Pundit::NotAuthorizedError, with: :render_not_authorized_error

      def auth
        @api_key      = fetch_api_key
        @current_user = @api_key&.user
        raise Api::Errors::InvalidAuthentication unless @api_key
        raise Api::Errors::InvalidAuthentication, 'API User is disabled' if @current_user&.disabled
      end

      attr_reader :current_user

      def user
        user_id_type = request.headers['X-USER-ID-TYPE']
        @user ||= begin
          u = if user_id_type == 'external_id'
                ::Users::Regular.find_by(project_id: project_id, external_id: user_id)
              else
                ::Users::Regular.find_by(project_id: project_id, id: user_id)
              end

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

      def ensure_campaign
        if params[:campaign_id]
          @campaign = policy_scope(
            Campaign,
            policy_scope_class: ::Administration::CampaignPolicy::Scope
          ).find_by(id: params[:campaign_id])
          unless @campaign
            raise(Api::Errors::ResourceNotFound,
                  "Campaign with id=#{params[:campaign_id]} was not found")
          end
        else
          @campaign = user.campaigns.last
          raise(Api::Errors::ResourceNotFound, 'User does not belong to any campaign') unless @campaign
        end
      end

      def project_id
        params[:project_id]
      end

      def user_id
        params[:user_id]
      end

      delegate :project_membership, to: :user

      def render_validation_errors(form)
        raise Api::Errors::ValidationFailed, form.errors.full_messages.first
      end

      def render_error(e)
        render json: { code: e.code, message: e.message, more_info: e.more_info, meta: e.meta }, status: e.status
      end

      def render_not_authorized_error
        e = Api::Errors::Unauthorized.new
        audit! :user_not_authorized, current_user, payload: params, outcome: :failed, failure_reason: e.message
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

      def set_request_interface
        request.env['interface'] = 'api'
      end

      def find_application
        key_value, = ActionController::HttpAuthentication::Basic.user_name_and_password(request)
        return if key_value.blank?

        ::Users::Application.joins(:api_keys).find_by(api_keys: { key: key_value, disabled: false })
      end

      def authorize_request_ip
        application = find_application

        raise Api::Errors::InvalidAuthentication unless application

        application_setting = application&.application_setting
        return if application_setting.ip_allowed?(request.remote_ip)

        raise Api::Errors::InvalidAuthentication
      end
    end
  end
end
