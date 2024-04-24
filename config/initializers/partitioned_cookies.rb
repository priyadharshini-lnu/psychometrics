# frozen_string_literal: true

class PartitionedCookies
  def initialize(app)
    @app = app
  end

  def call(env)
    status, headers, body = @app.call(env)

    set_cookie_header = headers['Set-Cookie']

    if set_cookie_header&.include?('SameSite=None')
      headers['Set-Cookie'].gsub!('SameSite=None', 'SameSite=None; Partitioned;')
    end

    [status, headers, body]
  end
end

Rails.application.config.middleware.insert_before(ActionDispatch::Cookies, PartitionedCookies)
