# frozen_string_literal: true

module Api
  module V1
    class Base < BaseCommand
      BASIC_AUTH = 'Basic'
      BEARER_AUTH = 'Bearer'

      attr_reader :request

      def initialize(request:)
        @request = request
      end

      def authorization_scheme
        if basic_credentials?
          BASIC_AUTH
        elsif bearer_token.present?
          BEARER_AUTH
        end
      end

      def basic_credentials?
        ActionController::HttpAuthentication::Basic.has_basic_credentials?(request)
      end

      def bearer_token
        token, = ActionController::HttpAuthentication::Token.token_and_options(request)
        token.presence
      end
    end
  end
end
