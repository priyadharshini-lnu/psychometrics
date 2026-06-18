# frozen_string_literal: true

# middleware to convert cookies to cross site format for proctoring
# converts same_site=Lax to same_site=None in cross site requests
class CrossSiteCookies
  def initialize(app)
    @app = app
  end

  def call(env)
    status, headers, body = @app.call(env)

    set_cookie = headers['Set-Cookie']
    return [status, headers, body] unless set_cookie

    return [status, headers, body] unless proctoring_context?(env)

    headers['Set-Cookie'] = convert_to_cross_site(set_cookie)

    [status, headers, body]
  end

  private

  def proctoring_context?(env)
    iframe_request?(env) || proctoring_session?(env)
  end

  def iframe_request?(env)
    env['HTTP_SEC_FETCH_DEST'] == 'iframe'
  end

  def proctoring_session?(env)
    session = env['rack.session']
    return false unless session

    proctoring_mode = proctoring_mode_active?(session)
    sso_iframe = session.dig(:sso, 'display') == 'iframe'
    proctoring_mode || sso_iframe
  rescue StandardError
    false
  end

  def proctoring_mode_active?(session)
    session[:proctoring_mode] == true
  end

  def convert_to_cross_site(cookie)
    Array.wrap(cookie).map { |c| upgrade_to_partitioned(c) }
  end

  def upgrade_to_partitioned(cookie)
    cookie.gsub(/samesite=lax/i, 'SameSite=None; Partitioned;')
  end
end

Rails.application.config.middleware.insert_before(ActionDispatch::Cookies, CrossSiteCookies)
