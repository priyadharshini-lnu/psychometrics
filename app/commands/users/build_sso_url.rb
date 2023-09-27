# frozen_string_literal: true

module Users
  class BuildSsoUrl < BaseCommand
    attr_reader :project, :user, :ttl

    def initialize(project, user, ttl = 4.hours)
      @project = project
      @user = user
      @ttl = ttl
    end

    def call
      url = gen_url
      broadcast :ok, [url, Time.zone.now + ttl]
    end

    def gen_url
      protocol = Settings.protocol || 'http'
      token = user.generate_sso_token(ttl)
      URI("#{protocol}://#{project.subdomain}.#{Settings.domain}:#{Settings.port}/sso/#{user.id}/#{token}").to_s
    end
  end
end
