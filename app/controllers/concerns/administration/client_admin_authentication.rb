# frozen_string_literal: true

module Administration
  module ClientAdminAuthentication
    extend ActiveSupport::Concern

    private

    def handle_handoff_login
      return if params[:handoff_token].blank?
      return unless Current.client_admin_context?

      result = AdminAuth::ConsumeHandoffToken.call(
        params[:handoff_token],
        expected_client_id: Current.client.id
      )

      if result[:error]
        handle_handoff_error(result[:error])
        return
      end

      handoff_data = result[:ok]
      complete_handoff_login(handoff_data)
    end

    def handle_handoff_error(error)
      error_key = case error
                    when :expired, :already_used
                      'admin.handoff_token_expired'
                    when :client_mismatch
                      'admin.handoff_client_mismatch'
                    when :user_disabled
                      'admin.handoff_user_disabled'
                    else
                      'admin.handoff_invalid_token'
                  end

      flash[:alert] = I18n.t(error_key, default: I18n.t('errors.forbidden'))
      redirect_to new_administration_session_path
    end

    def complete_handoff_login(handoff_data)
      user = handoff_data[:user]

      access = verify_client_access(user)
      return unless access

      sign_in_with_client_context(user, handoff_data[:impersonated_by_id])
      store_client_session_data(access, impersonated_by_id: handoff_data[:impersonated_by_id])
      audit_handoff_login(user, handoff_data)

      redirect_to after_sign_in_path_for(user)
    end

    def verify_client_access(user)
      if superadmin_without_client_role?(user)
        flash[:alert] = I18n.t('admin.superadmin_use_root_domain', default: I18n.t('errors.forbidden'))
        redirect_to new_administration_session_path
        return nil
      end

      result = AdminAuth::ResolveClientAccess.call(user, Current.client)

      if result[:error]
        flash[:alert] = I18n.t('admin.no_client_access', default: I18n.t('errors.forbidden'))
        redirect_to new_administration_session_path
        return nil
      end

      result[:ok]
    end

    def sign_in_with_client_context(user, impersonated_by_id = nil)
      if impersonated_by_id.present?
        sign_in(:user, user, skip_session_limitable: true)
      else
        sign_in(:user, user)
      end
    end

    def store_client_session_data(access, impersonated_by_id: nil)
      session[:client_id] = Current.client.id
      session[:authenticated_at] = Time.current.to_i
      session[:impersonated_by_id] = impersonated_by_id

      Current.memberships = access[:memberships]
      Current.membership_roles = access[:roles]
    end

    def setup_client_admin_after_password_login(user)
      return true unless Current.client_admin_context?

      if superadmin_without_client_role?(user)
        sign_out(user)
        flash[:alert] = I18n.t('admin.superadmin_use_root_domain', default: I18n.t('errors.forbidden'))
        return false
      end

      access = AdminAuth::ResolveClientAccess.call(user, Current.client)

      if access[:error]
        sign_out(user)
        flash[:alert] = I18n.t('admin.no_client_access', default: I18n.t('errors.forbidden'))
        return false
      end

      store_client_session_data(access[:ok])
      true
    end

    def superadmin_without_client_role?(user)
      return false unless user.is?(:superadmin)

      admin_roles = [Membership::CLIENT_ADMIN_ROLE, Membership::PROJECT_ADMIN_ROLE, Membership::CAMPAIGN_ADMIN_ROLE]
      user.memberships.
        where(client_id: Current.client.subtree_ids, role: admin_roles).
        none?
    end

    def audit_handoff_login(user, handoff_data)
      return if handoff_data[:impersonated_by_id].present?

      audit!(:admin_handoff_login, user,
             payload: { email: user.email, client_id: handoff_data[:client_id] })
    end
  end
end
