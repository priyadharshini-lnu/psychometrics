# frozen_string_literal: true

require_relative '../locale_validator'

module Middlewares
  class SetLocaleMiddleware
    def initialize(app)
      @app = app
    end

    def call(env)
      request = ActionDispatch::Request.new(env)
      I18n.locale = LocaleValidator.sanitize(request.cookies['locale'])
      @app.call(env)
    end
  end
end
