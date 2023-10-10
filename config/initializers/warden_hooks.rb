# frozen_string_literal: true

Warden::Manager.after_authentication do |user, env, _opts|
  request = Rack::Request.new(env.request.env)

  if request.env['action_dispatch.request.unsigned_session_cookie']['saml_audit'].blank?
    AuditLogModule.audit! :sign_in,
                          user,
                          user: user,
                          payload: { email: user.email },
                          outcome: 'successful'
  end
end

Warden::Manager.after_set_user do |user, auth, opts|
  scope = opts[:scope]
  auth.request.session["#{scope}.id"] = user.id
end

Warden::Manager.before_logout do |_user, auth, opts|
  scope = opts[:scope]
  auth.request.session["#{scope}.id"] = nil
end

Warden::Manager.before_failure do |env, opts|
  request = Rack::Request.new(env)

  if request.env[:sso].blank?
    session = request.env['action_dispatch.request.unsigned_session_cookie']
    action = session['saml_audit'].present? ? :saml_login : :sign_in
    reason = opts[:message] ? "devise.#{opts[:message]}" : nil
    AuditLogModule.audit! action, nil,
                          record_type: 'User',
                          payload: { email: request.params.dig('user', 'email') },
                          outcome: 'failed',
                          failure_reason: reason
  end
end

Warden::Manager.before_logout do |user, _auth, _opts|
  AuditLogModule.audit! :sign_out, user,
                        record_type: 'User',
                        payload: { email: user.email }
end
