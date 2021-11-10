# frozen_string_literal: true

module Sms
  class Send < BaseCommand
    private_attr_reader :to_mobile_no, :message, :options

    def initialize(to_mobile_no, message, options = {})
      @to_mobile_no = to_mobile_no
      @message = message
      @options = options
    end

    def call
      client.messages.create(
        options.merge(
          from: Rails.application.secrets.twilio[:from_mobile_no],
          to: to_mobile_no,
          body: message
        )
      )

      broadcast :ok
    end

    def client
      account_sid = Rails.application.secrets.twilio[:account_sid]
      api_key = Rails.application.secrets.twilio[:api_key]
      api_secret = Rails.application.secrets.twilio[:api_secret]
      Twilio::REST::Client.new api_key, api_secret, account_sid
    end
  end
end
