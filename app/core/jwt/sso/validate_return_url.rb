# frozen_string_literal: true

module Jwt
  module Sso
    class ValidateReturnUrl < BaseCommand
      ALLOWED_PLACEHOLDERS = ['ASSESSMENT_STATUS'].freeze

      private_attr_reader :return_url, :application

      def initialize(return_url:, application:)
        @return_url = return_url
        @application = application
      end

      def call
        return broadcast(:ok, nil) if return_url.blank?
        return broadcast(:error, :invalid_return_url) unless valid_return_url?
        return broadcast(:error, :invalid_return_url) unless placeholders_valid?
        return broadcast(:error, :return_url_not_whitelisted) unless url_whitelisted?

        broadcast(:ok, return_url)
      end

      private

      def valid_return_url?
        Utility::Url.valid?(return_url)
      end

      def placeholders_valid?
        placeholders = return_url.scan(/[A-Z][A-Z_]+/).uniq
        (placeholders - ALLOWED_PLACEHOLDERS).empty?
      end

      def url_whitelisted?
        application_setting = application.application_setting
        return true unless application_setting&.url_whitelisting_enabled?

        application_setting.url_allowed?(return_url)
      end
    end
  end
end
