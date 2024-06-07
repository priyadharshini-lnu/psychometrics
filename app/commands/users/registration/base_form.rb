# frozen_string_literal: true

module Users
  module Registration
    class BaseForm < Rectify::Form
      attribute :email, String
      attribute :first_name, String
      attribute :last_name, String
      attribute :mobile_number, String
      attribute :mobile_verification_token, String

      validates :email, :first_name, :last_name, presence: true
      validate :validate_email_uniqueness
      validate :validate_mobile_number
      validate :validate_mobile_number_verification_token

      private

      def validate_email_uniqueness
        if User.exists?(email: email, project_id: context.project.id)
          errors.add(:email,
                     I18n.t('activemodel.errors.models.register.attributes.email.in_use'))
        end
      end

      def validate_communication_email
        return if errors.messages.present?

        unless Communication.new_users_recipients.exists?(campaign: campaign)
          errors.add(:base,
                     I18n.t('devise.registrations.communication_not_setup_error'))
        end
      end

      def validate_mobile_number
        return unless registration_setting.require_mobile_number

        return if mobile_number.present?

        errors.add(:mobile_number,
                   I18n.t('activemodel.errors.models.register.attributes.mobile_number.blank'))
      end

      def validate_mobile_number_verification_token
        return true unless registration_setting.require_mobile_number

        return false if mobile_verification_token.blank?

        begin
          decoded = JWT.decode(mobile_verification_token, Rails.application.secrets.encrypted_key)
          return true if decoded[0]['data'] == mobile_number
        rescue JWT::ExpiredSignature
          errors.add(:mobile_number,
                     I18n.t('activemodel.errors.models.register.attributes.mobile_number.verification_expired'))
        else
          errors.add(:mobile_number,
                     I18n.t('activemodel.errors.models.register.attributes.mobile_number.invalid'))
        end
      end

      def registration_setting
        @registration_setting ||= context.project.registration_setting
      end

      def campaign
        raise NotImplementedError
      end
    end
  end
end
