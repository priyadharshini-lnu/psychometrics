# frozen_string_literal: true

module Sms
  class TwilioClient
    def self.get
      return @client if @client

      account_sid = Settings.secrets.twilio[:account_sid]
      api_key = Settings.secrets.twilio[:api_key]
      api_secret = Settings.secrets.twilio[:api_secret]
      @client = Twilio::REST::Client.new api_key, api_secret, account_sid
    end
  end
end
