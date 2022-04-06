# frozen_string_literal: true

module Webhooks
  class SmsHistoriesController < ActionController::Base
    skip_before_action :verify_authenticity_token

    def status
      response = URI.decode_www_form(request.raw_post).to_h
      sms_history_id, = JWT.decode(params[:token], Rails.application.secrets.webhook_jwt_secret).dig(0, 'data')
      sms_history = SmsHistory.find_by(id: sms_history_id)
      return head :ok unless sms_history

      attrs = { status: response['MessageStatus'] }

      unless sms_history.price
        message = Sms::TwilioClient.get.messages(sms_history.twilio_sid).fetch
        attrs = attrs.merge(price: message.price.to_f.abs, segment_length: message.num_segments.to_i)
      end

      sms_history.update!(attrs)

      head :ok
    end

    private

    def sms_history_params
      params.permit(:status, :error_message, :date_sent)
    end
  end
end
