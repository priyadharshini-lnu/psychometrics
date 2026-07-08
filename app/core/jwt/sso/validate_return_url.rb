# frozen_string_literal: true

module Jwt
  module Sso
    class ValidateReturnUrl < BaseCommand
      ALLOWED_PLACEHOLDERS = ['ASSESSMENT_STATUS'].freeze

      private_attr_reader :return_url

      def initialize(return_url:)
        @return_url = return_url
      end

      def call
        return broadcast(:ok, nil) if return_url.blank?
        return broadcast(:error, :invalid_return_url) unless valid_return_url?
        return broadcast(:error, :invalid_return_url) unless placeholders_valid?

        broadcast(:ok, return_url)
      end

      private

      def valid_return_url?
        Utility::Url.safe_internal_url?(return_url) || Utility::Url.valid?(return_url)
      end

      def placeholders_valid?
        placeholders = return_url.scan(/[A-Z][A-Z_]+/).uniq
        (placeholders - ALLOWED_PLACEHOLDERS).empty?
      end
    end
  end
end
