# frozen_string_literal: true

module Users
  class RegisterForm < Rectify::Form
    attribute :email, String
    attribute :first_name, String
    attribute :last_name, String
    attribute :registration_code, String

    validates :email, :first_name, :last_name, :registration_code,
              presence: { message: I18n.t('administration.clients.registration_codes.errors.presence') }
    validates :first_name, :last_name, :email, length: { maximum: 100 }
    validates :email, format: { with: Devise.email_regexp,
                                message: I18n.t('administration.clients.registration_codes.errors.invalid_attribute') }

    validate :validate_registration_code

    private

    def validate_registration_code
      registration_code_record = Administration::Clients::RegistrationCodes::VerificationQuery.
                                 new(context.project, registration_code).query
      if registration_code_record.blank?
        errors.add(:registration_code,
                   I18n.t('administration.clients.registration_codes.errors.invalid_attribute',
                          attribute: 'Registration Code'))
      end
    end
  end
end
