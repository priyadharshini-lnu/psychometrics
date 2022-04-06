# frozen_string_literal: true

module Sms
  class TwilioClient
    def self.get
      return @client if @client

      account_sid = Rails.application.secrets.twilio[:account_sid]
      api_key = Rails.application.secrets.twilio[:api_key]
      api_secret = Rails.application.secrets.twilio[:api_secret]
      @client = Twilio::REST::Client.new api_key, api_secret, account_sid
    end
  end
end
