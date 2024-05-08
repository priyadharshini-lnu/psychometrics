# frozen_string_literal: true

module Webhooks
  class SmsHistoriesController < ActionController::Base
    skip_before_action :verify_authenticity_token

    def status
      response = URI.decode_www_form(request.raw_post).to_h
      sms_history_id, = JWT.decode(params[:token], Settings.secrets.webhook_jwt_secret).dig(0, 'data')
      sms_history = SmsHistory.find_by(id: sms_history_id)
      return head :ok unless sms_history

      sms_history.update!(status: response['MessageStatus'])

      head :ok
    end

    private

    def sms_history_params
      params.permit(:status, :error_message, :date_sent)
    end
  end
end
