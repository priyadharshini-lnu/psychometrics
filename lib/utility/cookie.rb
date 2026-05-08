# frozen_string_literal: true

module Utility
  class Cookie
    def self.expire_auth_cookies(response)
      cookie_name = Rails.application.config.session_options[:key]
      expire_cookie(response, cookie_name)
    end

    def self.expire_cookie(response, cookie_name)
      secure = Rails.application.config.session_options[:secure]

      expire_with_options(response, cookie_name, same_site: :none, secure: true)
      expire_with_options(response, cookie_name, same_site: :none, secure: true, partitioned: true)
      expire_with_options(response, cookie_name, same_site: :lax, secure: secure)
    end

    def self.expire_with_options(response, cookie_name, **options)
      Rack::Utils.set_cookie_header!(
        response.headers, cookie_name,
        { path: '/', expires: Time.at(0).utc, value: '' }.merge(options)
      )
    end
  end
end
