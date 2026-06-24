# frozen_string_literal: true

module PsyGlobalStateHelper
  def psy_global_state_json
    {
      realEnv: Settings.real_env,
      adminLocales: Settings.admin_user_locales,
      recaptchaSiteKey: Recaptcha.configuration.site_key,
      sentryUrl: Settings.sentry_url.presence || '',
      sentryDebug: Settings.sentry_debug.presence || 'false',
      availableAiProviders: Settings.available_ai_providers.to_s,
      currentUser: current_user_data,
      features: Settings.features.to_h.transform_values { |v| v == true },
      clientContextData: client_context_data,
      switchableClients: switchable_clients_data,
      recentClientIds: recent_client_ids_data
    }.to_json
  end

  private

  def current_user_data
    return { id: nil, email: nil } unless current_user

    current_user.as_json(only: %i[id email])
  end

  def client_context_data
    return nil unless Current.client_admin_context? && Current.client

    Administration::ClientContextSerializer.new.serialize(Current.client).as_json
  end

  def switchable_clients_data
    return [] unless user_signed_in? && Current.client_admin_context?
    return [] if current_user.is?(:superadmin)

    impersonator = resolve_impersonator
    active_ids   = AdminAuth::SessionRegistry.
                   active_client_ids(current_user, impersonator: impersonator).
                   to_set

    switchable = ActsAsTenant.without_tenant do
      current_user.
        clients_with_admin_access.
        includes(:client_sso_setting, design_setting: { logo_attachment: :blob }).
        select(:id, :name, :subdomain).
        order(:name).
        to_a
    end

    Panko::ArraySerializer.new(
      switchable,
      each_serializer: Administration::ClientSelectionSerializer,
      context: { active_ids: active_ids }
    ).as_json
  end

  def recent_client_ids_data
    return [] unless user_signed_in? && Current.client_admin_context?
    return [] if current_user.is?(:superadmin)

    AdminAuth::SessionRegistry.recent_client_ids(
      current_user,
      impersonator: resolve_impersonator,
      limit: 4
    )
  end

  def resolve_impersonator
    return nil if session[:impersonated_by_id].blank?

    User.find_by(id: session[:impersonated_by_id])
  end
end
