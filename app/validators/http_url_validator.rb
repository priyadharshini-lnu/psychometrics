# frozen_string_literal: true

class HttpUrlValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    return if options[:presence] == false && value.blank?

    unless Utility::Url.valid?(value)
      record.errors.add(attribute, options[:message] || I18n.t('activerecord.errors.messages.invalid_http_url'))
    end
  end
end
