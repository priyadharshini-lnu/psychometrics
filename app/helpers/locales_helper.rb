# frozen_string_literal: true

module LocalesHelper
  LOCALES = {
    'ar' => 'rtl'
  }.freeze

  def rtl?
    LOCALES[I18n.locale[0...2]] == 'rtl'
  end

  def dir
    rtl? ? 'rtl' : 'ltr'
  end
end
