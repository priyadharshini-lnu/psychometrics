# frozen_string_literal: true

class RepeatsInPasswordValidator < ActiveModel::EachValidator
  # Regex for repeats symbols or words
  REPEATS = /(.)\1{3,}|(.{2,})\2{1,}/.freeze

  def validate_each(record, attribute, value)
    if REPEATS.match?(value) || containcs_sequences?(value)
      record.errors.add(attribute, I18n.t('activemodel.errors.models.profile.attributes.password.contains_repeats'))
    end
  end

  private

  def containcs_sequences?(password)
    return unless password

    check(password) || check(password.reverse)
  end

  def check(string)
    string.split('').slice_when { |x, y| y != x.next }.all? { |a| a.size > 2 }
  end
end
