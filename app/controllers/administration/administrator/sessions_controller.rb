# frozen_string_literal: true

module Administration
  module Administrator
    class SessionsController < Devise::SessionsController
      include Administration::ClientAdminAuthentication

      skip_before_action :set_current_user_in_current_attributes, only: [:create]
      prepend_before_action :clear_stale_session_for_handoff, only: [:new]
      prepend_before_action :ensure_redirect_to_saml, only: [:create]
      prepend_before_action :reject_superadmin_on_client_subdomain, only: [:create]
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
        if (user = user_from_params)
          if (saml = AdminAuth::SamlRedirectGuard.for_user(user: user, return_url: stored_location_for(:user))).required
            redirect_to new_saml_user_session_url(saml_email_token: saml.token)
          elsif (sso = AdminAuth::ResolveSsoRedirect.for_client(user: user, client: Current.client)).required
            Utility::Url.redirect_to_safe_internal_url(self, sso.url, allow_other_host: true)
          else
            session[:user_email] = user.email
            redirect_to new_administration_session_path
          end
        else
          session[:user_email] = params.dig(:user, :email)
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

        if Current.client_admin_context?
          access = AdminAuth::ResolveClientAccess.call(resource, Current.client)
          return assessors_dashboard_path if access[:ok] && assessor_dashboard_after_handoff?(resource, access[:ok])

          return "#{admin_path}/clients/#{Current.client.id}/projects"
        end

        central_admin_redirect = central_admin_redirection(resource)
        return central_admin_redirect if central_admin_redirect

        default_admin_path_for(resource)
      end

      def default_admin_path_for(resource)
        return '/admin/clients' if resource.has_grant?(:clients, :view)
        return "#{admin_path}/dashboards" if helpers.show_dashboard?

        admin_path
      end

      def central_admin_redirection(resource)
        return nil unless AdminSubdomain.client_admin_sso_enabled?
        return nil if resource.is?(:superadmin)
        # A root domain assessor has no client and no assignment, so their dashboard would be empty.
        return "#{admin_path}/user_availabilities" if resource.root_domain_assessor?

        has_client_access = resource.clients_with_admin_access.exists?

        if has_client_access
          administration_client_selection_path
        else
          sign_out(resource)
          flash.discard(:notice)
          flash[:alert] = I18n.t('admin.no_client_access_root')
          new_administration_session_path
        end
      end

      def after_sign_out_path_for(_resource)
        return admin_url(subdomain: Settings.subdomain) if impersonating?
        return new_administration_session_path if request.host == Settings.domain || !Current.client_admin_context?

        administration_full_signout_url(subdomain: Settings.subdomain)
      end

      private

      # Signed-in admins bounce straight back to the shell, which renders no flash — drop the dead alert.
      def require_no_authentication
        super
        flash.delete(:alert) if performed?
      end

      def reject_superadmin_on_client_subdomain
        return unless Current.client_admin_context?

        if user_from_params&.is?(:superadmin)
          flash[:alert] =
            I18n.t('admin.superadmin_use_root_domain')
          redirect_to new_administration_session_path and return
        end
      end

      # Guards the standard Devise :create path (form POST with credentials).
      # authenticate_user independently guards the email-first path (POST /authenticate_user).
      # Both must check SamlRedirectGuard because the two entry points are mutually exclusive.
      def ensure_redirect_to_saml
        return unless (user = user_from_params)

        if (saml = AdminAuth::SamlRedirectGuard.for_user(user: user, return_url: stored_location_for(:user))).required
          if Current.client_admin_context?
            Utility::Url.redirect_to_safe_internal_url(self, root_admin_saml_url(saml.token), allow_other_host: true)
          else
            redirect_to new_saml_user_session_url(saml_email_token: saml.token)
          end
        elsif (sso = AdminAuth::ResolveSsoRedirect.for_client(user: user, client: Current.client)).required
          Utility::Url.redirect_to_safe_internal_url(self, sso.url, allow_other_host: true)
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
        return unless handoff_token_present? && Current.client_admin_context?

        request.reset_session
      end

      def superadmin_stored_client_selection?(resource, path)
        resource.is?(:superadmin) && path.include?('client_selection')
      end

      def user_from_params
        @user_from_params ||= User.find_by(email: params.dig(:user, :email))
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

      def skip_authentication?
        true
      end
    end
  end
end
