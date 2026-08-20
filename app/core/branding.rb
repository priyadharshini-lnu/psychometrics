# frozen_string_literal: true

# Names are static because config/locales/*/branding.yml was deleted; the commented lookups need it back.
module Branding
  PUBLISHED_PRIVACY_NOTICE_VERSION = 'current'
  PRODUCT_NAME = 'Lighthouse'
  DISPLAY_NAMES = { 'marsh' => 'Marsh', 'mercer_a_marsh_business' => 'Mercer, a Marsh business' }.freeze
  LEGAL_NAMES = { 'marsh' => 'Marsh', 'mercer_a_marsh_business' => 'Mercer Talent Enterprise' }.freeze
  # The masthead follows the notice version, not the deployment brand.
  POLICY_LOGO_NAMES = {
    'current' => PRODUCT_NAME,
    'marsh' => DISPLAY_NAMES.fetch('marsh'),
    'mercer_a_marsh_business' => DISPLAY_NAMES.fetch('mercer_a_marsh_business')
  }.freeze
  EMAIL_LOGO_ASPECTS = { 'marsh' => 800.0 / 175, 'mercer_a_marsh_business' => 929.0 / 261 }.freeze
  POLICY_LOGO_WIDTHS = { 'marsh' => 148 }.freeze

  class << self
    def brand
      Settings.branding.brand
    end

    def display_name
      DISPLAY_NAMES.fetch(brand)
      # I18n.t("branding.#{brand}.display_name", locale: locale)
    end

    def legal_name
      LEGAL_NAMES.fetch(brand)
      # I18n.t("branding.#{brand}.legal_name", locale: locale)
    end

    def product_name
      PRODUCT_NAME
      # I18n.t('product_name', locale: locale)
    end

    def support_email
      Settings.branding.support_email
    end

    def support_contact_email
      Settings.branding.support_contact_email
    end

    def email_logo
      asset(:email_logo)
    end

    def email_logo_size(height)
      "#{(height * EMAIL_LOGO_ASPECTS.fetch(brand)).round}x#{height}"
    end

    def privacy_notice(locale: nil)
      version = Settings.privacy_notice.version
      notice = I18n.t("privacy_notice.#{version}", locale: locale, default: '')
      return notice if written?(notice)

      Rails.logger.warn("privacy_notice version #{version.inspect} has no copy yet, " \
                        "serving #{PUBLISHED_PRIVACY_NOTICE_VERSION.inspect} instead")
      I18n.t("privacy_notice.#{PUBLISHED_PRIVACY_NOTICE_VERSION}", locale: locale)
    end

    def policy_logo
      Settings.privacy_notice.logos[policy_logo_version]
    end

    def policy_logo_width
      POLICY_LOGO_WIDTHS[policy_logo_version]
    end

    def policy_logo_name
      POLICY_LOGO_NAMES.fetch(policy_logo_version)
      # I18n.t(POLICY_LOGO_NAME_KEYS.fetch(policy_logo_version), locale: locale)
    end

    private

    def policy_logo_version
      version = Settings.privacy_notice.version
      return version if POLICY_LOGO_NAMES.key?(version) && Settings.privacy_notice.logos[version].present?

      Rails.logger.warn("privacy_notice version #{version.inspect} has no logo, " \
                        "serving #{PUBLISHED_PRIVACY_NOTICE_VERSION.inspect} instead")
      PUBLISHED_PRIVACY_NOTICE_VERSION
    end

    def asset(name)
      Settings.branding.assets[brand][name]
    end

    # A version Legal has not written yet holds an HTML comment, which strips to nothing.
    def written?(notice)
      ActionController::Base.helpers.strip_tags(notice).strip.present?
    end
  end
end
