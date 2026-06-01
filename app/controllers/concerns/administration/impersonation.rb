# frozen_string_literal: true

module Administration
  module Impersonation
    extend ActiveSupport::Concern

    private

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
