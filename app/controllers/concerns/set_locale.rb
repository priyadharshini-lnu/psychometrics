module SetLocale
  extend ActiveSupport::Concern

  included do
    helper_method :user_locale
    helper_method :user_locale_rtl?
  end

  def user_locale
    @user_locale ||= begin
      probably_locale = request.env['HTTP_ACCEPT_LANGUAGE'].scan(/^[a-z]{2}/).first
      probably_locale = params[:lang] if I18n.available_locales.include?(params[:lang]&.to_sym)
      probably_locale = I18n.default_locale unless I18n.available_locales.include?(probably_locale&.to_sym)
      probably_locale&.to_s
    end
  end

  def user_locale_rtl?
    user_locale == 'ar'
  end
end
