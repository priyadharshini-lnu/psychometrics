# frozen_string_literal: true

module Api
  module V1
    module Projects
      class UpdateForm < Rectify::Form
        attribute :name, String
        attribute :subdomain, String
        attribute :client_reference, String
        attribute :locales, [String]
        attribute :data_processing_consent, Boolean
        attribute :enable_strong_password, Boolean
        attribute :enable_2factor_auth, Boolean
        attribute :project_logo, String
        attribute :partner_logo, String
        attribute :background_image, String
        attribute :background_color, String
        attribute :login_box_position, String
        attribute :webhook, String
        attribute :logo_alt_text, String
        attribute :secondary_logo_alt_text, String

        validates :login_box_position, inclusion: { in: %w[left right center auto] }, allow_nil: true
        validates :background_color, hex_color: true
        validates :project_logo, base64: { presence: false }
        validates :partner_logo, base64: { presence: false }
        validates :background_image, base64: { presence: false }
        validates :webhook, http_url: { presence: false }
        validates :subdomain, length: { minimum: 3, maximum: 32 }, allow_nil: true
        validates :logo_alt_text,
                  length: { maximum: ::DesignSetting::MAX_ALT_TEXT_LENGTH },
                  format: { with: ::DesignSetting::ALLOWED_CHARACTERS_REGEX }, if: -> { logo_alt_text.present? }
        validates :secondary_logo_alt_text,
                  length: { maximum: ::DesignSetting::MAX_ALT_TEXT_LENGTH },
                  format: { with: ::DesignSetting::ALLOWED_CHARACTERS_REGEX },
                  if: -> { secondary_logo_alt_text.present? }

        validate :validate_locales
        validate :validate_subdomain
        validate :uniq_subdomain
        validate :reserved_subdomain
        validate :admin_subdomain
        validate :single_subscription

        def validate_locales
          (locales || []).each do |locale|
            errors.add(:locales, "Invalid locale \"#{locale}\"") if Settings.enduser_locales.exclude?(locale)
          end
        end

        def single_subscription
          if context&.project&.webhooks&.many?
            errors.add(:webhook, I18n.t('errors.webhooks.multiple_webhook_error'))
          end
        end

        def validate_subdomain
          return if subdomain.nil?
          return if /^[a-z0-9](?:[a-z0-9\-]{0,61}[a-z0-9])?$/.match?(subdomain)

          errors.add(:subdomain, 'Wrong subdomain format')
        end

        def uniq_subdomain
          return if subdomain.nil?
          return unless Client.where.not(id: id).exists?(subdomain: subdomain)

          errors.add(:subdomain, "'#{subdomain}' is already taken")
        end

        def reserved_subdomain
          return if subdomain.nil?
          return if Settings.reserved_subdomains.exclude? subdomain

          errors.add(:subdomain, "'#{subdomain}' is reserved")
        end

        def admin_subdomain
          return if subdomain.nil?
          return unless Client::RESERVED_ADMIN_SUBDOMAIN_PATTERNS.any? { |pattern| pattern.match?(subdomain) }

          errors.add(:subdomain, I18n.t('admin.subdomain_admin_keyword'))
        end
      end
    end
  end
end
