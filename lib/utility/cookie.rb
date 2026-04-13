# frozen_string_literal: true

module Utility
  class Cookie
    def self.expire_auth_cookies(response)
      cookie_name = Rails.application.config.session_options[:key]
      expire_cookie(response, cookie_name)
    end

    def self.expire_cookie(response, cookie_name)
      expiry = 'Thu, 01 Jan 1970 00:00:00 GMT'
      secure = Rails.application.config.session_options[:secure] ? '; Secure' : ''
      append_set_cookie(response, "#{cookie_name}=; path=/; expires=#{expiry}; SameSite=None; Secure")
      append_set_cookie(response, "#{cookie_name}=; path=/; expires=#{expiry}; SameSite=Lax#{secure}")
    end

    def self.append_set_cookie(response, cookie_string)
      existing = response.headers['Set-Cookie']
      response.headers['Set-Cookie'] = existing ? "#{existing}\n#{cookie_string}" : cookie_string
    end
  end
end
