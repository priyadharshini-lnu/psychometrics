# frozen_string_literal: true

module LocaleValidator
  def self.valid?(locale)
    locale.present? && I18n.available_locales.map(&:to_s).include?(locale.to_s)
  end

  def self.sanitize(locale, default: I18n.default_locale)
    valid?(locale) ? locale : default
  end
end
