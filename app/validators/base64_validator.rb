# frozen_string_literal: true

class Base64Validator < ActiveModel::EachValidator
  def validate_each(object, attribute, value)
    return if options[:presence] == false && value.blank?

    unless %r{^data:image/(png|svg\+xml|jpeg);base64,[-A-Za-z0-9+=\/]{1,}|=[^=]|={3,}$}.match?(value)
      object.errors[attribute] << (options[:message] || 'must be base64 format')
    end
  end
end
