# frozen_string_literal: true

module AddCookie
  extend ActiveSupport::Concern

  def add_cookie(name, value, expires: nil, httponly: true)
    secure = Settings.protocol == 'https'
    cookie_options = {
      value: value,
      httponly: httponly,
      secure: secure,
      same_site: secure ? 'None' : 'Lax'
    }
    cookie_options[:expires] = expires if expires
    cookies[name] = cookie_options
  end
end
