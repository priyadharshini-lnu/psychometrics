# frozen_string_literal: true

class StripForwardedHostMiddleware
  def initialize(app)
    @app = app
  end

  def call(env)
    # Remove the X-Forwarded-Host header to prevent host header attacks
    env.delete('HTTP_X_FORWARDED_HOST')
    @app.call(env)
  end
end
