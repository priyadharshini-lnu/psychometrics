# frozen_string_literal: true

Warden::Manager.after_authentication do |user, auth, options|
  if auth.env['action_dispatch.cookies']
    expected_cookie_value = "#{user.class}-#{user.public_send(Devise.second_factor_resource_id)}"
    actual_cookie_value = auth.env['action_dispatch.cookies'].signed[TwoFactorAuthentication::REMEMBER_TFA_COOKIE_NAME]
    bypass_by_cookie = actual_cookie_value == expected_cookie_value
  end

  saml_login = auth.winning_strategies[options[:scope]].is_a?(Devise::Strategies::SamlAuthenticatable)

  if user.respond_to?(:need_two_factor_authentication?) && !bypass_by_cookie && !saml_login
    need_auth = user.need_two_factor_authentication?(auth.request)
    auth.session(options[:scope])[TwoFactorAuthentication::NEED_AUTHENTICATION] = need_auth
    user.send_new_otp if need_auth && user.send_new_otp_after_login?
  end
end

Warden::Manager.before_logout do |_user, auth, _options|
  auth.cookies.delete TwoFactorAuthentication::REMEMBER_TFA_COOKIE_NAME if Devise.delete_cookie_on_logout
end
