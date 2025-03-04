# frozen_string_literal: true

module Sms
  class Send < BaseCommand
    private_attr_reader :to_mobile_no, :body, :options

    def initialize(to_mobile_no, body, options = {})
      @to_mobile_no = to_mobile_no
      @body = body
      @options = options
    end

    def call
      message = Sms::TwilioClient.get.messages.create(
        **options, from: Settings.secrets.twilio[:from_mobile_no],
                   to: to_mobile_no,
                   body: body
      )

      broadcast :ok, message
    end
  end
end
