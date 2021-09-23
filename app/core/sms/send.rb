# frozen_string_literal: true

module Sms
  class Send < BaseCommand
    private_attr_reader :to_mobile_no, :message

    def initialize(to_mobile_no, message)
      @to_mobile_no = to_mobile_no
      @message = message
    end

    def call
      client = Twilio::REST::Client.new
      client.messages.create(
        from: Rails.application.secrets.twilio[:from_mobile_no],
        to: to_mobile_no,
        body: message
      )

      broadcast :ok
    end
  end
end
