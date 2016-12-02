module GetLocale
  extend ActiveSupport::Concern

  included do
    helper_method :user_locale
  end

  def user_locale
    @user_locale ||= begin
      probably_locale = request.env['HTTP_ACCEPT_LANGUAGE'].scan(/^[a-z]{2}/).first
      probably_locale = params[:lang] if params[:lang] && Settings.languages.include?(params[:lang])
      Settings.languages.include?(probably_locale) ? probably_locale : 'en'
    end
  end
end
