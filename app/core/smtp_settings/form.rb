# frozen_string_literal: true

module SmtpSettings
  class Form < Rectify::Form
    DOMAIN_REGEX = /\A((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}\Z/.freeze

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

    validates :from_name, :from_email, :host, :encryption, :port, presence: true
    validates :authentication_type, :user_name, :password, presence: true, if: :authentication?
    validates :from_email, format: { with: Devise.email_regexp }, allow_blank: true
    validates :port, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 65535 }, allow_blank: true
    validate :validate_host

    def validate_host
      if host && !DOMAIN_REGEX.match?(host)
        errors.add(:host, I18n.t('administration.clients.registration_codes.errors.incorrect_domain'))
      end
    end
  end
end
