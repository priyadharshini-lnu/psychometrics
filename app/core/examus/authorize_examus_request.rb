# frozen_string_literal: true

module Examus
  class AuthorizeExamusRequest < BaseCommand
    private_attr_reader :headers, :errors

    def initialize(headers = {})
      @headers = headers
      @errors = {}
    end

    def call
      proctored_session
    end

    private

    def proctored_session
      if decoded_auth_token
        @proctoring_session ||= ProctoringSession.find_by(session_id: decoded_auth_token[:sessionId])
      end

      @proctoring_session || (add_error(:token, 'Invalid token') && nil)
    end

    def decoded_auth_token
      @decoded_auth_token ||= Examus::JwtTokenizer.decode(http_auth_header)
    end

    def http_auth_header
      if headers['Authorization'].present?
        return headers['Authorization'].split.last
      else
        add_error(:token, 'Missing token')
      end

      nil
    end

    def add_error(key, value)
      errors[key] ||= []
      errors[key] << value
      errors[key].uniq!
    end
  end
end
