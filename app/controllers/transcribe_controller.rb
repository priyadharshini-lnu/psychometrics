# frozen_string_literal: true

class TranscribeController < BaseController
  include AuthenticateAnonymousUser

  prepend_before_action :authenticate_anonymous_user!
  before_action :set_locale
  append_before_action :pundit_authorize

  def pre_sign_url
    case Settings.ai_transcription_provider&.real_time_provider
      when 'oci'
        OciSpeech::Realtime::Token.call do
          on(:ok) { |result| render json: result.merge(provider: 'oci') }
          on(:error) { |error| render json: { error: error }, status: :service_unavailable }
        end
      else
        url = Transcribe::PreSignUrl.call!
        render json: { url: url, provider: 'aws' }
    end
  end

  def pundit_authorize
    authorize :transcribe
  end

  private

  def set_locale
    I18n.locale = ui_locale
  end
end
