# frozen_string_literal: true

Warden::Manager.before_failure do |env, _opts|
  request = Rack::Request.new(env)
  AuditLogModule.audit! :sign_in_fail, nil, payload: request.params, request: request
end

Warden::Manager.after_authentication do |user, _env, _opts|
  AuditLogModule.audit! :sign_in_success, user, payload: { email: user.email }
end

Warden::Manager.after_set_user do |user, auth, opts|
  scope = opts[:scope]
  auth.request.session["#{scope}.id"] = user.id
end

Warden::Manager.before_logout do |_user, auth, opts|
  scope = opts[:scope]
  auth.request.session["#{scope}.id"] = nil
end
