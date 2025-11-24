# frozen_string_literal: true

Warden::Manager.after_authentication do |user, auth, _opts|
  request = auth.request
  if request.env['action_dispatch.request.unsigned_session_cookie']['saml_auth'].blank?
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
end

Warden::Manager.after_set_user do |user, auth, opts|
  scope = opts[:scope]
  auth.request.session["#{scope}.id"] = user.id
end

# Hook is added to show last login success or failure time to the user
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
  auth.request.session["#{scope}.id"] = nil
end

# Tracks last_unsuccessful_attempt for a user
Warden::Manager.before_failure do |env, _opts|
  request = ActionDispatch::Request.new(env)

  url = env['HTTP_HOST'] || env['SERVER_NAME']
  subdomain =  url.split('.').first
  subdomain =  url.gsub("#{Settings.subdomain}.", '').split('.').first if Settings.subdomain
  project = GetProjectBySubdomain.call!(subdomain)
  email = request.params.dig('user', 'email')
  user = User.find_by(email: email, project_id: project&.id)
  user&.update(last_unsuccessful_attempt: Time.now.utc)
end

Warden::Manager.before_failure do |env, opts|
  request = ActionDispatch::Request.new(env)
  email = request.params.dig('user', 'email')
  next if email.blank?

  if request.env[:sso].blank?
    session = request.env['action_dispatch.request.unsigned_session_cookie']
    action = session&.dig('saml_auth').present? ? :saml_login : :sign_in
    reason = opts[:message] ? "devise.#{opts[:message]}" : "devise.#{opts[:action]}"
    AuditLogModule.audit! action, nil,
                          record_type: 'User',
                          payload: { email: email },
                          outcome: 'failed',
                          request_details: {
                            ip: request.remote_ip, request_id: request.env['action_dispatch.request_id']
                          },
                          interface_details: { user_agent: request.user_agent },
                          failure_reason: reason
  end
end
