# frozen_string_literal: true

require 'siem_logger'

module WardenAuthLogger
  class << self
    def log_failure(env, opts)
      request = ActionDispatch::Request.new(env)
      email = request.params.dig('user', 'email')
      return if email.blank?

      return if request.env[:sso].present?

      session = request.env['action_dispatch.request.unsigned_session_cookie']
      action = session&.dig('saml_auth').present? ? :saml_login : :sign_in
      reason = opts[:message] ? "devise.#{opts[:message]}" : "devise.#{opts[:action]}"

      AuditLogModule.audit! action,
                            nil,
                            record_type: 'User',
                            payload: { email: email },
                            outcome: 'failed',
                            request_details: { ip: request.remote_ip,
                                               request_id: request.env['action_dispatch.request_id'] },
                            interface_details: { user_agent: request.user_agent },
                            failure_reason: reason

      auth_channel = determine_auth_channel(action, request)
      identity_provider = determine_identity_provider(auth_channel, action, find_project(request))
      actor = SiemLogger.user_identifier(email)
      SiemLogger.log_security_event!('LoginFailure',
                                     actor_name: actor,
                                     context: "User email: #{actor}",
                                     request_details: SiemLogger.build_request_details(request, identity_provider),
                                     msg: "Failed login attempt for #{email}, reason: #{reason}",
                                     authentication_channel: auth_channel, identity_provider: identity_provider)
    end

    def log_success(user, auth)
      request = auth.request

      is_saml = request.env['action_dispatch.request.unsigned_session_cookie']['saml_auth'].present?

      unless is_saml
        AuditLogModule.audit! :sign_in,
                              user,
                              user: user,
                              payload: { email: user.email },
                              project: user.project,
                              outcome: 'successful',
                              request_details: { ip: request.remote_ip,
                                                 request_id: request.env['action_dispatch.request_id'] },
                              interface_details: { user_agent: request.user_agent }
      end

      log_siem_success(request, user, is_saml)
    end

    private

    def determine_auth_channel(action, request)
      if action == :saml_login
        'SAML'
      elsif request.params[:controller].to_s.include?('magic_links')
        'MagicLink'
      else
        'Password Login'
      end
    end

    def determine_identity_provider(auth_channel, action, project)
      if auth_channel == 'SAML'
        saml_setting = project&.saml_setting
        saml_setting ? saml_setting.entity_id : 'MMC-OKTA'
      elsif ['MagicLink', 'Password Login'].include?(auth_channel)
        ''
      else
        action.to_s
      end
    end

    def find_project(request)
      GetProjectBySubdomain.call!(request.subdomain)
    end

    def log_siem_success(request, user, is_saml)
      is_magic_link = request.session[:login_via_magic_link] || request.params[:controller].to_s.include?('magic_links')

      auth_channel = if is_magic_link
                       'MagicLink'
                     elsif is_saml
                       'SAML'
                     else
                       'Password Login'
                     end

      identity_provider = ''
      if auth_channel == 'SAML'
        saml_setting = user.project&.saml_setting
        identity_provider = saml_setting ? saml_setting.entity_id : 'MMC-OKTA'
      end

      actor = SiemLogger.user_identifier(user.email, user.id)
      SiemLogger.log_security_event!('LoginSuccessful',
                                     actor_name: actor,
                                     context: "User email: #{actor}",
                                     request_details: SiemLogger.build_request_details(request, identity_provider),
                                     msg: "User #{actor} logged in",
                                     authentication_channel: auth_channel,
                                     session_id: user.id,
                                     identity_provider: identity_provider)
    end
  end
end

Warden::Manager.after_authentication do |user, auth, _opts|
  WardenAuthLogger.log_success(user, auth)
end

Warden::Manager.after_set_user do |user, auth, opts|
  scope = opts[:scope]
  auth.request.session["#{scope}.id"] = user.id
end

Warden::Manager.after_set_user do |user, auth, _opts|
  request = auth.request
  session = request.session
  flash = session.dig(:flash, 'flashes')
  notice = flash&.dig('notice')

  next unless notice

  unless session.dig('warden.user.user.session', 'need_two_factor_authentication')

    if user.last_unsuccessful_attempt.present?
      flash['notice'] += "  #{I18n.t('devise.sessions.unsuccessful_sign_in_time',
                                     date_time: I18n.l(user.last_unsuccessful_attempt.in_time_zone(Time.zone),
                                                       format: :short))}"
    elsif user.last_sign_in_at.present?
      flash['notice'] += "  #{I18n.t('devise.sessions.signed_in_time',
                                     date_time: I18n.l(user.last_sign_in_at.in_time_zone(Time.zone),
                                                       format: :short))}"
    end

    user.update(last_unsuccessful_attempt: nil) if user.last_unsuccessful_attempt
  end
end

Warden::Manager.before_logout do |_user, auth, opts|
  scope = opts[:scope]
  request = auth.request

  request.session["#{scope}.id"] = nil
end

# Tracks last_unsuccessful_attempt for a user
Warden::Manager.before_failure do |env, _opts|
  request = ActionDispatch::Request.new(env)

  project = GetProjectBySubdomain.call!(request.subdomain)
  email = request.params.dig('user', 'email')
  user = User.find_by(email: email, project_id: project&.id)
  user&.update(last_unsuccessful_attempt: Time.now.utc)
end

Warden::Manager.before_failure do |env, opts|
  WardenAuthLogger.log_failure(env, opts)
end
