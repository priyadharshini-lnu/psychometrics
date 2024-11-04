# frozen_string_literal: true

module SmtpSettings
  class Form < Rectify::Form
    mimic :smtp_setting_form

    SMTP_AUTH_ATTRIBUTES = %i[host port encryption user_name password authentication_type].freeze

    attribute :test_email_id, String
    attribute :enabled, Boolean
    attribute :from_name, String
    attribute :from_email, String
    attribute :host, String
    attribute :port, String
    attribute :encryption, String
    attribute :authentication, Boolean
    attribute :authentication_type, String
    attribute :user_name, String
    attribute :password, String
    attribute :use_sender_verification, Boolean

    validates :from_name, presence: true, if: :enabled?
    validates :from_email, presence: true, if: :apply_all_field_validation?
    validates :host, :encryption, :port, presence: true, if: lambda {
                                                               apply_all_field_validation? && !use_sender_verification
                                                             }
    validates :authentication_type, :user_name, :password, presence: true,
      if: -> { apply_all_field_validation? && authentication? }
    validates :from_email, format: { with: Devise.email_regexp }, allow_blank: true
    validates :host, format: { with: RegexConstants::DOMAIN_REGEX }, allow_blank: true
    validates :port, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 655_35 }, allow_blank: true
    validates :test_email_id, format: { with: Devise.email_regexp }, allow_blank: true

    def apply_all_field_validation?
      return false unless enabled?

      return false if from_email.present? && from_email_domain == Settings.domain

      %i[from_email host port].any? do |attribute|
        public_send(attribute).present?
      end
    end

    def attributes
      attrs = super.except(:authentication, :test_email_id)
      return attrs.except(*SMTP_AUTH_ATTRIBUTES) if use_sender_verification

      attrs
    end

    def from_email_domain
      return unless from_email

      from_email.split('@').last
    end
  end
end
