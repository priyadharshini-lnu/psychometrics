# frozen_string_literal: true

module Administration
  module Administrator
    class SessionsController < Devise::SessionsController
      prepend_before_action :verify_recaptcha_or_redirect, only: [:create]
      before_action :ensure_redirect_to_saml, only: [:create]

      helper_method :resource_nam, :devise_mapping
      layout 'administration/devise'

      def authenticate_user
        user = User.find_by(email: params[:user][:email])

        if user
          if user.saml_enforced_for_admins?
            redirect_to new_saml_user_session_url(return_url: stored_location_for(:user))
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
        super do
          audit!(
            :sign_out, logged_in_user,
            user: logged_in_user,
            payload: { email: logged_in_user.email }
          )
          Utility::Cookie.expire_auth_cookies(response)
          WardenAuthLogger.log_sign_out(logged_in_user, request, scope: :user)
          session[:proctoring_mode] = false
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
        return stored_path_for_resource if stored_path_for_resource.present?

        return '/admin/clients' if resource.has_grant?(:clients, :view)
        return "#{admin_path}/dashboards" if helpers.show_dashboard?
        return assessors_dashboard_path if resource.is?(:assessor)

        admin_path
      end

      def after_sign_out_path_for(_resource)
        root_path
      end

      def ensure_redirect_to_saml
        return if Settings.features.disable_saml_for_admins

        user = User.find_by(email: params[:user][:email])
        if user&.saml_enforced_for_admins?
          redirect_to new_saml_user_session_url(return_url: stored_location_for(:user)) and return
        end
      end

      private

      def verify_recaptcha_or_redirect
        return if SkipRecaptcha.call!(request)

        unless verify_recaptcha(response: params[:recaptcha_token])
          flash[:alert] = I18n.t('administration.administrator.sessions.errors.recaptcha')
          redirect_to root_path and return
        end
      end
    end
  end
end
