# frozen_string_literal: true

module Administration
  module Administrator
    class SessionsController < Devise::SessionsController
      include Administration::ClientAdminAuthentication

      prepend_before_action :clear_stale_session_for_handoff, only: [:new]
      prepend_before_action :ensure_redirect_to_saml, only: [:create]
      prepend_before_action :verify_recaptcha_or_redirect, only: [:create]

      helper_method :resource_name, :devise_mapping
      layout 'administration/devise'

      def new
        handle_handoff_login if handoff_token_present?
        return if performed?

        @client_context = Current.client if Current.client_admin_context?
        super
      end

      def create
        self.resource = warden.authenticate!(auth_options)

        unless setup_client_admin_after_password_login(resource)
          redirect_to new_administration_session_path and return
        end

        set_flash_message!(:notice, :signed_in)
        sign_in(resource_name, resource)
        yield resource if block_given?

        respond_with resource, location: after_sign_in_path_for(resource)
      end

      def authenticate_user
        user = User.find_by(email: params[:user][:email])

        if user
          if user.saml_enforced_for_admins?
            token = AdminAuth::SamlIntentToken.encode(email: user.email, return_url: stored_location_for(:user))
            redirect_to new_saml_user_session_url(saml_email_token: token)
          elsif (client_sso_url = sole_client_sso_url(user))
            Utility::Url.redirect_to_safe_internal_url(self, client_sso_url, allow_other_host: true)
          else
            session[:user_email] = user.email
            redirect_to new_administration_session_path
          end
        else
          flash[:alert] = I18n.t('devise.failure.not_found_in_database')
          redirect_to new_administration_session_path
        end
      end

      def destroy
        logged_in_user = current_user
        impersonator_id = session[:impersonated_by_id]

        return super unless logged_in_user

        invalidate_admin_session(logged_in_user, impersonator_id)

        super do
          audit!(
            :sign_out, logged_in_user,
            user: logged_in_user,
            payload: { email: logged_in_user.email },
            impersonated_by_id: impersonator_id
          )
          Utility::Cookie.expire_auth_cookies(response)
          WardenAuthLogger.log_sign_out(logged_in_user, request, scope: :user)
          session[:proctoring_mode] = false
          request.reset_session
        end
      end

      def resource_name
        :user
      end

      def devise_mapping
        @devise_mapping ||= Devise.mappings[:user]
      end

      # Redirect administrator after log in
      def after_sign_in_path_for(resource)
        stored_path_for_resource = stored_location_for(resource)
        if stored_path_for_resource.present? && !superadmin_stored_client_selection?(resource, stored_path_for_resource)
          return stored_path_for_resource
        end

        return "#{admin_path}/clients/#{Current.client.id}/projects" if Current.client_admin_context?

        central_admin_redirect = central_admin_redirection(resource)
        return central_admin_redirect if central_admin_redirect

        default_admin_path_for(resource)
      end

      def default_admin_path_for(resource)
        return '/admin/clients' if resource.has_grant?(:clients, :view)
        return "#{admin_path}/dashboards" if helpers.show_dashboard?
        return assessors_dashboard_path if resource.is?(:assessor)

        admin_path
      end

      def central_admin_redirection(resource)
        return nil unless AdminSubdomain.client_admin_sso_enabled?
        return nil if resource.is?(:superadmin)

        has_client_access = resource.clients_with_admin_access.exists?
        return nil if resource.is?(:assessor) && !has_client_access

        if has_client_access
          administration_client_selection_path
        else
          sign_out(resource)
          flash[:alert] = I18n.t('admin.no_client_access')
          new_administration_session_path
        end
      end

      def after_sign_out_path_for(_resource)
        return admin_url(subdomain: Settings.subdomain) if impersonating?
        return new_administration_session_path if request.host == Settings.domain || !Current.client_admin_context?

        administration_full_signout_url(subdomain: Settings.subdomain)
      end

      private

      def ensure_redirect_to_saml
        return if Settings.features.disable_saml_for_admins

        user = User.find_by(email: params[:user][:email])
        return unless user&.saml_enforced_for_admins?

        token = AdminAuth::SamlIntentToken.encode(email: user.email, return_url: stored_location_for(:user))

        if client_admin_context?
          Utility::Url.redirect_to_safe_internal_url(self, root_admin_saml_url(token), allow_other_host: true)
        else
          redirect_to new_saml_user_session_url(saml_email_token: token)
        end
      end

      def root_admin_saml_url(token)
        new_saml_user_session_url(
          host: Settings.domain, subdomain: Settings.subdomain,
          protocol: Settings.protocol, port: Settings.port,
          saml_email_token: token
        )
      end

      def verify_recaptcha_or_redirect
        return if SkipRecaptcha.call!(request)

        unless verify_recaptcha(response: params[:recaptcha_token])
          flash[:alert] = I18n.t('administration.administrator.sessions.errors.recaptcha')
          redirect_to root_path and return
        end
      end

      def handoff_token_present?
        params[:handoff_token].present?
      end

      def clear_stale_session_for_handoff
        return unless handoff_token_present? && client_admin_context?

        request.reset_session
      end

      def superadmin_stored_client_selection?(resource, path)
        resource.is?(:superadmin) && path.include?('client_selection')
      end

      def sole_client_sso_url(user)
        return unless AdminSubdomain.client_admin_sso_enabled?

        client = user.sole_admin_client
        return unless client&.client_sso_setting&.saml_enforced?

        token = AdminAuth::SamlIntentToken.encode(email: user.email)
        AdminSubdomain.admin_url_for(client, path: '/users/saml/sign_in', params: { saml_email_token: token })
      end

      def client_admin_context?
        Current.client_admin_context?
      end

      def impersonating?
        session[:impersonated_by_id].present?
      end

      def invalidate_admin_session(user, impersonator_id)
        impersonator = User.find_by(id: impersonator_id) if impersonator_id.present?

        if impersonator
          AdminAuth::SessionRegistry.invalidate_all_impersonated(user, impersonator: impersonator)
        else
          AdminAuth::SessionRegistry.invalidate_all_real(user)
        end
      end
    end
  end
end
