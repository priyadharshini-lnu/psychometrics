# frozen_string_literal: true

module Users
  class RegisterForm < Rectify::Form
    attribute :email, String
    attribute :first_name, String
    attribute :last_name, String
    attribute :password, String
    attribute :password_confirmation, String
    attribute :registration_code, String

    validates :email, :first_name, :last_name, :password,
              :password_confirmation, :registration_code, presence: true
    validates_confirmation_of :password

    validate :validate_registration_code

    private

    def validate_registration_code
      registration_code_record = Administration::Clients::RegistrationCodes::VerificationQuery.
                                 new(context.project, registration_code).query
      errors.add(:registration_code, :invalid) if registration_code_record.blank?
    end
  end
end
