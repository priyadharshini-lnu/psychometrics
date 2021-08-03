# frozen_string_literal: true

module Utility
  class Locale
    def self.end_user_locales
      end_user_locales = Settings.enduser_locales.map(&:to_sym)
      I18n.t('languages', locale: :en).slice(*end_user_locales)
    end
  end
end
