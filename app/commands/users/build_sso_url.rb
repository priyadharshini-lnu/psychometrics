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
      [url, Time.now + TTL]
    end

    def gen_url
      "#{Settings.port == 443 ? 'https://' : 'http://'}#{project.subdomain}.#{Settings.domain}/sso/#{user.id}/#{token}"
    end

    def token
      @token ||= SecureRandom.urlsafe_base64(20, false)
    end
  end
end
