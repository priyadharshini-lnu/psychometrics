# frozen_string_literal: true

class HttpUrlValidator < ActiveModel::EachValidator
  HOST_REGEX = /.+\.[a-z]{2,7}\z/ix
  VALID_SCHEMES = %w[http https].freeze

  def validate_each(record, attribute, value)
    return if options[:presence] == false && value.blank?

    unless valid?(value)
      record.errors.add(attribute, options[:message] || I18n.t('activerecord.errors.messages.invalid_http_url'))
    end
  end

  private

  def valid?(url)
    uri = URI.parse(url)
    return false unless VALID_SCHEMES.include?(uri.scheme)

    return false unless HOST_REGEX.match?(uri.host)

    true
  rescue URI::InvalidURIError
    false
  end
end
