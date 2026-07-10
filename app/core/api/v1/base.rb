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
        raw_header = authorization_header
        return if raw_header.blank?

        raw_header[/\ABearer\s+(.+)\z/i, 1]&.presence
      end

      private

      def authorization_header
        request.get_header('HTTP_AUTHORIZATION') || request.headers['Authorization'] || request.headers['authorization']
      end
    end
  end
end
