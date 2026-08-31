# frozen_string_literal: true

require 'warden_auth_logger'

Warden::Manager.after_authentication do |user, auth, opts|
  WardenAuthLogger.log_success(user, auth, opts)
end

Warden::Manager.after_set_user do |user, auth, opts|
  scope = opts[:scope]
  auth.request.session["#{scope}.id"] = user.id
end

# Snapshots the prior sign-in fact once per authentication: the session marker feeds the React shell,
# the flash suffix still serves every Rails-rendered channel.
Warden::Manager.after_set_user do |user, auth, opts|
  next if opts[:event] == :fetch

  session = auth.request.session
  next if session.dig('warden.user.user.session', 'need_two_factor_authentication')

  notice = Users::SignInNotice.capture(user)
  next unless notice

  session[Users::SignInNotice::SESSION_KEY] = notice

  flash = session.dig(:flash, 'flashes')
  next unless flash&.dig('notice')

  I18n.locale = user.locale || user.project&.available_locales&.first || I18n.default_locale
  flash['notice'] += "  #{Users::SignInNotice.flash_suffix(notice)}"
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
