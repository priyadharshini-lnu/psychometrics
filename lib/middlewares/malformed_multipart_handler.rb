# frozen_string_literal: true

module Middlewares
  class MalformedMultipartHandler
    def initialize(app)
      @app = app
    end

    def call(env)
      @app.call(env)
    rescue Rack::Multipart::EmptyContentError
      [400, { 'Content-Type' => 'application/json' }, [{ error: 'Bad Request' }.to_json]]
    end
  end
end
