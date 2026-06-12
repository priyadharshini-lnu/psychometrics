# frozen_string_literal: true

module ClientScopeable
  extend ActiveSupport::Concern

  included do
    before_action :resolve_admin_membership
    before_action :enforce_client_scope, if: :client_admin_context?
  end

  private

  def resolve_admin_membership
    return unless user_signed_in? && Current.client

    result = AdminAuth::ResolveClientAccess.call(current_user, Current.client)
    return unless result[:ok]

    access = result[:ok]
    Current.memberships = access[:memberships]
    Current.membership_roles = access[:roles]
  end

  def enforce_client_scope
    return if Current.memberships&.any?
    return if Current.membership_roles&.include?('assessor')

    sign_out(current_user) if user_signed_in?
    flash[:alert] = I18n.t('admin.no_client_access')
    redirect_to new_administration_session_path
  end

  def client_admin_context?
    Current.client_admin_context?
  end

  def policy_scope(scope, *)
    scoped = super
    return scoped unless client_admin_context?

    AdminAuth::ClientScopeFilter.apply(scoped, Current.client)
  end
end
