# frozen_string_literal: true

module SmsInvites
  class ReplacePipeText < BaseCommand
    include Rails.application.routes.url_helpers

    private_attr_reader :message, :sms_invite

    def initialize(message, sms_invite)
      @message = message
      @sms_invite = sms_invite
    end

    def call
      url_params = {
        protocol: Settings.protocol,
        domain: Settings.domain,
        host: Settings.domain,
        port: Settings.port,
        subdomain: sms_invite.project.subdomain
      }
      invite_url = new_user_registration_url(
        url_params.merge(sms_invite_code: sms_invite.code)
      )
      short_url = Shortener::ShortenedUrl.generate(invite_url, owner: sms_invite)
      data = {
        first_name: sms_invite.first_name,
        last_name: sms_invite.last_name,
        invite_url: shortened_url(
          url_params.merge(id: short_url.unique_key)
        )
      }

      broadcast :ok, Mustache.render(message, data)
    end
  end
end
