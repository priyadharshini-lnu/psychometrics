# frozen_string_literal: true

module Users
  class RegisterForm < Rectify::Form
    attribute :email, String
    attribute :first_name, String
    attribute :last_name, String
    attribute :registration_code, String

    validates :email, :first_name, :last_name, :registration_code, presence: true
    validates :first_name, :last_name, :email, length: { maximum: 100 }
    validates :email, format: { with: Devise.email_regexp }
    validate :validate_email_uniqueness
    validate :validate_registration_code

    private

    def validate_email_uniqueness
      if User.exists?(email: email, project_id: context.project.id)
        errors.add(:email,
                   I18n.t('activemodel.errors.models.register.attributes.email.in_use'))
      end
    end

    def validate_registration_code
      registration_code_record = Administration::Clients::RegistrationCodes::VerificationQuery.
                                 new(context.project, registration_code).query
      if registration_code_record.blank?
        errors.add(:registration_code,
                   I18n.t('activemodel.errors.models.register.attributes.registration_code.invalid'))
      end
    end
  end
end
