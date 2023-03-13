# frozen_string_literal: true

module Api
  module Base
    class Contract < Dry::Validation::Contract
      register_macro(:http_url_format) do
        key.failure(I18n.t('activerecord.errors.messages.invalid_http_url')) unless Utility::Url.valid?(value)
      end
    end
  end
end
