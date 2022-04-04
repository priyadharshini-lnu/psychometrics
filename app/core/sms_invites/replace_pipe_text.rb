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
      invite_url = Utility::Url.generate(
        :new_user_registration_url, sms_invite_code: sms_invite.code, subdomain: sms_invite.project.subdomain
      )
      short_invite_url = Utility::Url.get_short_url(url: invite_url, owner: sms_invite)

      data = {
        first_name: sms_invite.first_name,
        last_name: sms_invite.last_name,
        invite_url: short_invite_url
      }

      broadcast :ok, Mustache.render(message, data)
    end
  end
end
