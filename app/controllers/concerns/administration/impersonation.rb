# frozen_string_literal: true

module Administration
  module Impersonation
    extend ActiveSupport::Concern

    private

    def spoof_admin_routing(target_user, client: nil, fallback_redirect_url: admin_path)
      if AdminSubdomain.client_admin_sso_enabled? && target_user.is?(:client_admin, :project_admin, :campaign_admin,
                                                                     :client_assessor)
        if client.nil?
          clients = target_user.clients_with_admin_access
          if clients.size > 1
            redirect_to administration_client_selection_path(spoof_user_id: target_user.id)
            return
          end
          client = clients.first
        end

        if client.present?
          redirect_via_handoff(target_user, client, impersonated_by: current_user)
          return
        end
      end

      impersonate_as_admin(target_user)
      redirect_to fallback_redirect_url, allow_other_host: true
    end

    def impersonate_as_admin(target_user)
      impersonator_id = current_user.id
      sign_in(target_user, skip_session_limitable: true)
      session[:impersonated_by_id] = impersonator_id
    end

    def impersonate_as_end_user(target_user)
      spoof_token = SecureRandom.urlsafe_base64(64)
      target_user.update_columns(spoof_token: spoof_token, spoofed_by_id: current_user.id)
      spoof_token
    end
  end
end
