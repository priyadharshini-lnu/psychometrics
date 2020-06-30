# frozen_string_literal: true

class TranscribeController < ApplicationController
  append_before_action :pundit_authorize

  def pre_sign_url
    url = Transcribe::PreSignUrl.call!
    render json: { url: url }
  end

  def pundit_authorize
    authorize :transcribe
  end
end
