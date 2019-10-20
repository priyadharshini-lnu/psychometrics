# frozen_string_literal: true

module Users
  class AuthenticateAnonymousUser < BaseCommand
    ANONYM_COOKIE_KEY = 'tte-anonym-payload'

    private_attr_reader :cookies

    def initialize(cookies)
      @cookies = cookies
    end

    def call
      if cookies[ANONYM_COOKIE_KEY]
        attrs = JSON.parse(cookies[ANONYM_COOKIE_KEY])
        broadcast :ok, User.find_by!(email: attrs['email'])
      end
    end
  end
end
