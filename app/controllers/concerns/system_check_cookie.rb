# frozen_string_literal: true

module SystemCheckCookie
  extend ActiveSupport::Concern

  private

  def store_session_id(session_id)
    cookies.signed[:system_check_session_id] = {
      value: session_id,
      expires: 30.days.from_now,
      httponly: true,
      secure: Settings.protocol == 'https',
      same_site: :lax
    }
  end

  def stored_session_id
    cookies.signed[:system_check_session_id]
  end
end
