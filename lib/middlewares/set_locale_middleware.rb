# frozen_string_literal: true

class SetLocaleMiddleware
  def initialize(app)
    @app = app
  end

  def call(env)
    request = ActionDispatch::Request.new(env)
    I18n.locale = request.cookies['locale'] || :en
    @app.call(env)
  end
end
