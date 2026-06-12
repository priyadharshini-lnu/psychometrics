# frozen_string_literal: true

module Administration
  module Administrator
    class ClientSelectionController < Administration::BaseController
      include Administration::ClientAdminAuthentication

      skip_before_action :enforce_geo_restriction
      skip_after_action :verify_authorized
      skip_after_action :verify_policy_scoped

      around_action :skip_tenant_scoping
      before_action :ensure_feature_enabled
      before_action :hide_navigation
      before_action :redirect_superadmin_without_spoof

      def index
        target = spoof_target_user
        user_for_clients = target || current_user

        sole_client = user_for_clients.sole_admin_client
        if sole_client
          impersonator = target.present? ? current_user : nil
          clear_central_session_for_single_client_user
          return handoff_and_redirect(
            user_for_clients,
            sole_client,
            spoofing: target.present?,
            impersonated_by: impersonator
          )
        end

        clients_list = user_for_clients.clients_with_admin_access.includes(:client_sso_setting).to_a
        highest_roles = AdminAuth::HighestClientRoles.for_user(user_for_clients, clients_list)

        @clients_data = Panko::ArraySerializer.new(
          clients_list,
          each_serializer: Administration::ClientSelectionSerializer,
          context: { highest_roles_by_client_id: highest_roles }
        ).to_a

        @spoof_user_id = target&.id

        respond_to do |format|
          format.html
          format.json { render json: { clients: @clients_data, spoof_user_id: @spoof_user_id } }
        end
      end

      def select
        target = spoof_target_user
        user_for_clients = target || current_user

        client = user_for_clients.clients_with_admin_access.find(params[:client_id])
        handoff_and_redirect(user_for_clients, client, spoofing: target.present?)
      end

      def switch
        client = current_user.clients_with_admin_access.find(params[:client_id])
        impersonator = User.find_by(id: session[:impersonated_by_id]) if session[:impersonated_by_id].present?
        handoff_and_redirect(current_user, client, impersonated_by: impersonator)
      end

      def full_signout
        if user_signed_in?
          AdminAuth::SessionRegistry.invalidate_all_real(current_user)
          sign_out(current_user)
        end
        request.reset_session
        redirect_to new_administration_session_path
      end

      private

      def ensure_feature_enabled
        return if AdminSubdomain.client_admin_sso_enabled?

        redirect_to admin_path, alert: I18n.t('admin.feature_not_available')
      end

      def hide_navigation
        @hide_navigation = true
      end

      def redirect_superadmin_without_spoof
        return unless current_user.is?(:superadmin) && params[:spoof_user_id].blank?

        redirect_to admin_path
      end

      def spoof_target_user
        return nil unless params[:spoof_user_id].present? && current_user.is?(:superadmin)

        User.find_by(id: params[:spoof_user_id])
      end

      def handoff_and_redirect(target_user, client, spoofing: false, impersonated_by: nil)
        if requires_sso_login?(client, spoofing, impersonated_by)
          token = AdminAuth::SamlIntentToken.encode(email: target_user.email)
          saml_url = AdminSubdomain.admin_url_for(
            client,
            path: '/users/saml/sign_in',
            params: { saml_email_token: token }
          )
          Utility::Url.redirect_to_safe_internal_url(self, saml_url, allow_other_host: true)
          return
        end

        impersonator = impersonated_by || (spoofing ? current_user : nil)

        redirect_via_handoff(target_user, client, impersonated_by: impersonator, on_error: lambda {
          flash[:alert] = I18n.t('admin.no_client_access')
          redirect_to administration_client_selection_path
        })
      end

      def requires_sso_login?(client, spoofing, impersonator)
        return false if spoofing
        return false if impersonator

        client.client_sso_setting&.saml_enforced?
      end

      # Single-client users don't need the central session since they'll never
      # use client switching. Clearing it here prevents the stale central session
      # from auto-authenticating them after they log out from the client subdomain.
      def clear_central_session_for_single_client_user
        sign_out(current_user)
      end

      def skip_tenant_scoping(&)
        ActsAsTenant.without_tenant(&)
      end
    end
  end
end
