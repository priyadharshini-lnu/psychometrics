# frozen_string_literal: true

module PsyGlobalStateHelper
  def psy_global_state_json
    {
      realEnv: Settings.real_env,
      brand: Branding.brand,
      supportEmail: Branding.support_email,
      adminLocales: Settings.admin_user_locales,
      recaptchaSiteKey: Recaptcha.configuration.site_key,
      sentryUrl: Settings.sentry_url.presence || '',
      sentryDebug: Settings.sentry_debug.presence || 'false',
      availableAiProviders: Settings.available_ai_providers.to_s,
      currentUser: current_user_data,
      impersonationData: impersonation_data,
      features: Settings.features.to_h.transform_values { |v| v == true },
      clientContextData: client_context_data,
      switchableClients: switchable_clients_data,
      recentClientIds: recent_client_ids_data,
      reactShell: react_shell?
    }.to_json
  end

  # True when the SPA owns the page's shell, so Rails renders no chrome around it.
  # rubocop:disable Rails/HelperInstanceVariable -- controller state by design; layout and boot payload must agree
  def react_shell?
    @do_not_render_rails_menu.present? && @hide_navigation.blank?
  end
  # rubocop:enable Rails/HelperInstanceVariable

  # The brand backdrop: Marsh pattern over a scheme-picked surface. Shared with the splash partial,
  # which paints it itself on layouts where `react_shell?` is false and the html carries no background.
  def brand_backdrop_style
    "background: light-dark(#F7F4EF, #061047) url(#{image_url('marsh-pattern.png')}) center / cover no-repeat"
  end

  # Shell pages paint the brand backdrop from the first byte.
  def shell_html_style
    style = 'color-scheme: light dark'
    style += "; #{brand_backdrop_style}" if react_shell?
    style
  end

  private

  def current_user_data
    return { id: nil, email: nil } unless current_user

    current_user.as_json(only: %i[id email])
  end

  def impersonation_data
    return nil unless user_signed_in?

    impersonator = resolve_impersonator
    return nil unless impersonator

    decorated_target = current_user.decorate
    {
      impersonator: { id: impersonator.id, email: impersonator.email, name: impersonator.decorate.display_name },
      target: {
        id: current_user.id,
        email: current_user.email,
        name: decorated_target.display_name,
        role: decorated_target.role
      }
    }
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
        includes(:client_sso_setting, client_design_setting: { logo_attachment: :blob }).
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

    @resolve_impersonator ||= User.find_by(id: session[:impersonated_by_id])
  end
end
