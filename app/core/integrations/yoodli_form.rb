# frozen_string_literal: true

module Integrations
  class YoodliForm < Integrations::BaseForm
    attribute :launch_url, String
    attribute :login_url, String
    attribute :keyset_url, String

    validates :launch_url, :login_url, :keyset_url, presence: true
    validate :basic_urls_are_valid

    private

    def basic_urls_are_valid
      %i[launch_url login_url keyset_url].each do |attr|
        url = send(attr)
        uri = URI.parse(url)

        if Rails.env.development?
          unless uri.is_a?(URI::HTTP) || uri.is_a?(URI::HTTPS)
            errors.add(attr, I18n.t('activerecord.errors.messages.invalid_http_url'))
          end
        else
          unless Utility::Url.valid?(url)
            errors.add(attr, I18n.t('activerecord.errors.messages.invalid_http_url'))
          end
        end
      end
    end
  end
end
