# frozen_string_literal: true

module SmtpSettings
  class Form < Rectify::Form
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

    validates :from_name, presence: true, if: :enabled?
    validates :from_email, :host, :encryption, :port, presence: true, if: :apply_all_field_validation?
    validates :authentication_type, :user_name, :password, presence: true,
      if: -> { apply_all_field_validation? && authentication? }
    validates :from_email, format: { with: Devise.email_regexp }, allow_blank: true
    validates :host, format: { with: RegexConstants::DOMAIN_REGEX }, allow_blank: true
    validates :port, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 655_35 }, allow_blank: true

    def apply_all_field_validation?
      return false unless enabled?

      %i[from_email host port].any? do |attribute|
        public_send(attribute).present?
      end
    end

    def attributes
      super.except(:authentication)
    end
  end
end
