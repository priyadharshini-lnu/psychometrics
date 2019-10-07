# frozen_string_literal: true

class HttpUrlValidator < ActiveModel::EachValidator
  # rubocop:disable Style/RegexpLiteral
  REGEX = /^(http:\/\/)?(https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/ix.freeze
  # rubocop:enable Style/RegexpLiteral

  def validate_each(record, attribute, value)
    record.errors.add(attribute, :invalid_http_url) unless value.present? && value =~ REGEX
  end
end
