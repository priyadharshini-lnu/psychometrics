# frozen_string_literal: true

class StrongPasswordValidator < ActiveModel::EachValidator
  # Regex for minimum 8 characters password with alphanumeric and special characters
  REGEX = /\A(?=.{8,})(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[[:^alnum:]])/x.freeze

  def validate_each(record, attribute, value)
    record.errors.add(attribute, I18n.t('administration.users.password.guidelines.error')) unless strong?(value)
  end

  private

  def strong?(password)
    return true if password.nil?
    return true if REGEX.match?(password)

    false
  end
end
