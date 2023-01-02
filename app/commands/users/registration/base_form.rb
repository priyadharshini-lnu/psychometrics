# frozen_string_literal: true

module Users
  module Registration
    class BaseForm < Rectify::Form
      attribute :email, String
      attribute :first_name, String
      attribute :last_name, String

      validates :email, :first_name, :last_name, presence: true
      validate :validate_email_uniqueness

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

      def campaign
        raise NotImplementedError
      end
    end
  end
end
