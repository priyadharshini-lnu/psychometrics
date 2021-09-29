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
    end
  end
end
