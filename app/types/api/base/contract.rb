# frozen_string_literal: true

module Api
  module Base
    class Contract < Dry::Validation::Contract
      register_macro(:email_format) do |macro:|
        allow_blank = macro.args[0][:allow_blank]

        unless valid_email?(value, allow_blank)
          key.failure(I18n.t('activemodel.errors.models.admin_edit.attributes.email.invalid'))
        end
      end

      register_macro(:http_url_format) do |macro:|
        allow_blank = macro.args[0][:allow_blank]

        unless valid_http_url?(value, allow_blank)
          key.failure(I18n.t('activerecord.errors.messages.invalid_http_url'))
        end
      end

      def valid_http_url?(value, allow_blank)
        return true if allow_blank && value.blank?

        Utility::Url.valid?(value)
      end

      def valid_email?(value, allow_blank)
        return true if allow_blank && value.blank?

        value&.match?(Devise.email_regexp)
      end
    end
  end
end
