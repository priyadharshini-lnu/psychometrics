# frozen_string_literal: true

module Api
  module V1
    class FetchApplication < Api::V1::Base
      def call
        application = case authorization_scheme
                        when BASIC_AUTH
                          find_application_with_basic_auth_keys
                        when BEARER_AUTH
                          find_application_with_bearer_token
                      end

        broadcast(:ok, application)
      end

      private

      def find_application_with_basic_auth_keys
        key_value, = ActionController::HttpAuthentication::Basic.user_name_and_password(request)
        return if key_value.blank?

        ::Users::Application.joins(:api_keys).find_by(api_keys: { key: key_value, disabled: false })
      end

      def find_application_with_bearer_token
        ::Jwt::ResolveApplication.call!(token: bearer_token)
      end
    end
  end
end
