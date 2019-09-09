# frozen_string_literal: true

module Users
  class BuildSsoUrl < Rectify::Command
    TTL = 30.minutes
    attr_reader :project, :user

    def initialize(project, user)
      @project = project
      @user = user
    end

    def call
      url = gen_url
      Redis.current.setex(user.sso_key, TTL, token)
      broadcast :ok, [url, Time.now + TTL]
    end

    def gen_url
      protocol = Settings.protocol || 'http'
      URI("#{protocol}://#{project.subdomain}.#{Settings.domain}:#{Settings.port}/sso/#{user.id}/#{token}").to_s
    end

    def token
      @token ||= SecureRandom.urlsafe_base64(20, false)
    end
  end
end
