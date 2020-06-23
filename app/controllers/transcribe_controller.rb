# frozen_string_literal: true

class TranscribeController < ApplicationController
  append_before_action :pundit_authorize

  def pre_sign_url
    signer = Aws::Sigv4::Signer.new(
      access_key_id: Rails.application.secrets.access_key_id,
      secret_access_key: Rails.application.secrets.secret_access_key,
      region: Rails.application.secrets.region,
      service: 'transcribe'
    )

    lang = 'en-US'
    sample_rate = 8000
    url = "wss://transcribestreaming.#{Rails.application.secrets.region}.amazonaws.com:8443/\
stream-transcription-websocket?language-code=#{lang}&media-encoding=pcm&sample-rate=#{sample_rate}"

    url = signer.presign_url(
      http_method: 'GET',
      url: url,
      protocol: 'wss',
      expires_in: 15
    )

    render json: { url: url }
  end

  def pundit_authorize
    authorize :transcribe
  end
end
