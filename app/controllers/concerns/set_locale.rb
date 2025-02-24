# frozen_string_literal: true

module SetLocale
  extend ActiveSupport::Concern

  included do
    helper_method :user_locale
    helper_method :user_locale_rtl?
    helper_method :selected_locale
    helper_method :available_enduser_locales
  end

  def user_locale # rubocop:disable Metrics/CyclomaticComplexity,Metrics/PerceivedComplexity
    @user_locale ||= begin
      probably_locale = params[:lang] if I18n.available_locales.include?(params[:lang]&.to_sym)
      probably_locale = ui_locale unless I18n.available_locales.include?(probably_locale&.to_sym)
      probably_locale = user_preferred_locale unless I18n.available_locales.include?(probably_locale&.to_sym)
      probably_locale = I18n.default_locale unless I18n.available_locales.include?(probably_locale&.to_sym)
      probably_locale&.to_s
    end
  end

  def user_locale_rtl?
    Settings.rtl_languages.include?(user_locale)
  end

  def selected_locale
    @selected_locale || user_locale
  end

  def ui_locale
    locale = [
      cookies[:locale],
      current_user&.locale,
      @current_project&.available_locales&.first
    ].find { |l| valid_ui_locale?(l) }

    # Fallback to default locale if params[:lang] is set but not valid
    if params[:lang].present?
      locale = valid_ui_locale?(params[:lang]) ? params[:lang] : I18n.default_locale.to_s
    end

    locale || I18n.default_locale.to_s
  end

  def valid_ui_locale?(locale)
    available_enduser_locales.include?(locale)
  end

  def available_enduser_locales
    @current_project&.available_locales || Settings.enduser_locales
  end

  # Adapted from https://github.com/rack/rack-contrib/blob/master/lib/rack/contrib/locale.rb
  def user_preferred_locale # rubocop:disable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
    header = request.env['HTTP_ACCEPT_LANGUAGE']
    return if header.nil?

    locales = header.gsub(/\s+/, '').split(',').map do |language_tag|
      locale, quality = language_tag.split(/;q=/i)
      quality = quality ? quality.to_f : 1.0
      [locale, quality]
    end.reject do |(locale, quality)|
      locale == '*' || quality.zero?
    end.sort_by do |(_, quality)|
      quality
    end.map(&:first)

    return if locales.empty?

    locale = locales.reverse.find do |l|
      available_enduser_locales.any? { |al| match_locale?(al, l) }
    end
    locale = available_enduser_locales.find { |al| match_locale?(al, locale) } if locale
  end

  def match_locale?(str1, str2)
    str1.to_s.casecmp(str2.to_s).zero?
  end
end
