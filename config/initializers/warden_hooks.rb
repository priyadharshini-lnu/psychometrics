# frozen_string_literal: true

require 'warden_auth_logger'

Warden::Manager.after_authentication do |user, auth, opts|
  WardenAuthLogger.log_success(user, auth, opts)
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
    I18n.locale = user.locale || user.project&.available_locales&.first || I18n.default_locale

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

  auth.env['sso_session'] = request.session[:sso].present?
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
