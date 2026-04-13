# frozen_string_literal: true

module CookieNotice
  extend ActiveSupport::Concern

  included do
    helper_method :cookie_notice_url_for
  end

  COOKIE_NOTICE_BASE_URL = 'https://www.mercer.com'
  COOKIE_NOTICE_PATH = '/regulatory/mercer-cookie-notice/'

  SUPPORTED_COOKIE_NOTICE_LOCALES = %w[
    en en-ca fr-ca fr-fr de-de pt-br es-mx es-es it-it pl-pl de-at nl-nl pt-pt
    tr-tr da-dk no-no nl-be hu-hu ro-ro sk-sk ru-ru kk-kz cs-cz sv-se el-gr
    ja-jp zh-tw zh-cn ko-kr ar-sa fi-fi id-id
  ].freeze

  LANGUAGE_TO_DEFAULT_LOCALE = {
    'fr' => 'fr-fr', 'de' => 'de-de', 'es' => 'es-es', 'it' => 'it-it',
    'pt' => 'pt-pt', 'nl' => 'nl-nl', 'pl' => 'pl-pl', 'tr' => 'tr-tr',
    'da' => 'da-dk', 'no' => 'no-no', 'hu' => 'hu-hu', 'ro' => 'ro-ro',
    'sk' => 'sk-sk', 'ru' => 'ru-ru', 'kk' => 'kk-kz', 'cs' => 'cs-cz',
    'sv' => 'sv-se', 'el' => 'el-gr', 'ja' => 'ja-jp', 'ko' => 'ko-kr',
    'ar' => 'ar-sa', 'fi' => 'fi-fi', 'id' => 'id-id', 'zh' => 'zh-cn'
  }.freeze

  COOKIE_NOTICE_URLS = SUPPORTED_COOKIE_NOTICE_LOCALES.each_with_object({}) do |locale, urls|
    locale_path = locale == 'en' ? '' : "/#{locale}"
    urls[locale] = "#{COOKIE_NOTICE_BASE_URL}#{locale_path}#{COOKIE_NOTICE_PATH}"
  end.freeze

  private

  def cookie_notice_url_for(locale)
    normalized_locale = normalize_cookie_notice_locale(locale)
    COOKIE_NOTICE_URLS.fetch(normalized_locale, COOKIE_NOTICE_URLS.fetch('en'))
  end

  def normalize_cookie_notice_locale(locale)
    normalized = locale.to_s.strip.tr('_', '-').downcase
    normalized = 'zh-tw' if normalized == 'zh-hant'

    return normalized if SUPPORTED_COOKIE_NOTICE_LOCALES.include?(normalized)

    language = normalized.split('-').first
    LANGUAGE_TO_DEFAULT_LOCALE.fetch(language, 'en')
  end
end
