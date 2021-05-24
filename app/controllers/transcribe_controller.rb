# frozen_string_literal: true

class TranscribeController < BaseController
  include AuthenticateAnonymousUser

  prepend_before_action :authenticate_anonymous_user!
  append_before_action :pundit_authorize

  def pre_sign_url
    url = Transcribe::PreSignUrl.call!
    render json: { url: url }
  end

  def pundit_authorize
    authorize :transcribe
  end
end
