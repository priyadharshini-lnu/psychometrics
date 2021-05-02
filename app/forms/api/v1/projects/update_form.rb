# frozen_string_literal: true

module Api
  module V1
    module Projects
      class UpdateForm < Rectify::Form
        attribute :name, String
        attribute :subdomain, String
        attribute :client_reference, String
        attribute :locales, Array[String]
        attribute :data_processing_consent, Boolean
        attribute :enable_strong_password, Boolean
        attribute :enable_2factor_auth, Boolean
        attribute :project_logo, String
        attribute :partner_logo, String
        attribute :background_image, String
        attribute :background_color, String
        attribute :login_box_position, String
        attribute :webhook, String

        validates :login_box_position, inclusion: { in: %w[left right center] }, allow_nil: true
        validates :background_color, hex_color: true
        validates :project_logo, base64: { presence: false }
        validates :partner_logo, base64: { presence: false }
        validates :background_image, base64: { presence: false }
        validates :webhook, http_url: { presence: false }

        validate :validate_locales
        validate :validate_subdomain
        validate :uniq_subdomain

        def validate_locales
          (locales || []).each do |locale|
            errors.add(:locales, "Invalid locale \"#{locale}\"") if Settings.enduser_locales.exclude?(locale)
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

          errors.add(:subdomain, "Subdomain #{subdomain} is already taken")
        end
      end
    end
  end
end
