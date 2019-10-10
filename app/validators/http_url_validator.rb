# frozen_string_literal: true

class HttpUrlValidator < ActiveModel::EachValidator
  HOST_REGEX = /.+\.[a-z]{2,5}\z/ix.freeze
  VALID_SCHEMES = %w[http https].freeze

  def validate_each(record, attribute, value)
    record.errors.add(attribute, :invalid_http_url) unless valid?(value)
  end

  private

  def valid?(url)
    uri = URI.parse(url)
    return false unless VALID_SCHEMES.include?(uri.scheme)

    return false unless HOST_REGEX =~ uri.host

    true
  rescue URI::InvalidURIError
    false
  end
end
