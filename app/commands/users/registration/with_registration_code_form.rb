# frozen_string_literal: true

module Users
  module Registration
    class WithRegistrationCodeForm < BaseForm
      attribute :registration_code, String
      validates :registration_code, presence: true
      validate :validate_registration_code
      validate :validate_restricted_domains

      def registration_code=(code)
        super code&.strip
      end

      private

      def validate_registration_code
        if registration_code_record.blank?
          errors.add(:registration_code,
                     I18n.t('activemodel.errors.models.register.attributes.registration_code.invalid'))
        end
      end

      def validate_restricted_domains
        restricted_domains = registration_code_record&.first&.restricted_domains
        if email.present? && restricted_domains.presence&.none? { |domain| email.split('@')&.last&.downcase == domain }
          errors.add(:email,
                     I18n.t('activemodel.errors.models.register.attributes.registration_code.incorrect_email_domain'))
        end
      end

      def registration_code_record
        @registration_code_record ||= Administration::Clients::RegistrationCodes::VerificationQuery.
                                      new(context.project, registration_code).query
      end
    end
  end
end
