# frozen_string_literal: true

class UpdateSmsHistoryJob < ApplicationJob
  EXECUTIONS_TO_RETRY_TIMINING = {
    1 => 5.minutes,
    2 => 60.minutes,
    3 => 8.hours,
    4 => 24.hours
  }.freeze
  retry_on StandardError, attempts: 5, wait: ->(executions) { EXECUTIONS_TO_RETRY_TIMINING[executions] }

  queue_as :default

  def perform(sms_history)
    twilio_sid = sms_history.twilio_sid
    message = Sms::TwilioClient.get.messages(twilio_sid).fetch

    if message.price.nil? || message.num_segments.nil?
      raise StandardError, "Price or num_of_segments not present for twilio message with sid #{twilio_sid}"
    end

    sms_history.update!(price: message.price.to_f.abs, segment_length: message.num_segments.to_i)
  end
end
