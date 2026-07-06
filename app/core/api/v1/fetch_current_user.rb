# frozen_string_literal: true

module Api
  module V1
    class FetchCurrentUser < Api::V1::Base
      def call
        current_user = case authorization_scheme
                         when BASIC_AUTH
                           fetch_api_key_user
                         when BEARER_AUTH
                           fetch_bearer_token_user
                       end
        broadcast(:ok, current_user)
      end

      private

      def fetch_api_key_user
        key, token = ActionController::HttpAuthentication::Basic.user_name_and_password(request)
        return nil if key.blank? || token.blank?

        possible_api_key = ApiKey.active.find_by(key: key)
        return nil if possible_api_key.nil? || possible_api_key.token != token

        possible_api_key.user
      end

      def fetch_bearer_token_user
        ::Api::V1::Jwt::ResolveBearerTokenUser.call!(token: bearer_token)
      end
    end
  end
end
