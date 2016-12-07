module GetLocale
  extend ActiveSupport::Concern

  included do
    helper_method :user_locale
  end

  def user_locale
    @user_locale ||= begin
      probably_locale = request.env['HTTP_ACCEPT_LANGUAGE'].scan(/^[a-z]{2}/).first
      probably_locale = params[:lang] if params[:lang] && Settings.languages.include?(params[:lang])
      I18n.locale = Settings.languages.include?(probably_locale) ? probably_locale.to_s : 'en'
      I18n.locale
    end
  end
end
