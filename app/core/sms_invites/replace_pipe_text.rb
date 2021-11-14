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
      short_invite_url = if Settings.short_url_host
                           shortened_url(id: short_url.unique_key, host: Settings.short_url_host)
                         else
                           shortened_url(
                             url_params.merge(id: short_url.unique_key, subdomain: Settings.subdomain)
                           )
                         end
      data = {
        first_name: sms_invite.first_name,
        last_name: sms_invite.last_name,
        invite_url: short_invite_url
      }

      broadcast :ok, Mustache.render(message, data)
    end
  end
end
