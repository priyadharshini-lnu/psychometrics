module GetLocale
  extend ActiveSupport::Concern

  included do
    helper_method :user_locale
  end

  def user_locale
    probably_locale = request.env['HTTP_ACCEPT_LANGUAGE'].scan(/^[a-z]{2}/).first
    Settings.languages.include?(probably_locale) ? probably_locale : 'en'
  end
end
